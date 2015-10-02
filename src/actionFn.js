"use strict";

import urlTransform from "./urlTransform";
import isFunction from "lodash/lang/isFunction";
import each from "lodash/collection/each";
import reduce from "lodash/collection/reduce";
import fetchResolver from "./fetchResolver";
import PubSub from "./PubSub";
import fastApply from "fast-apply";

function none() {}

function extractArgs(args) {
  let pathvars, params={}, callback;
  if (isFunction(args[0])) {
    callback = args[0];
  } else if (isFunction(args[1])) {
    pathvars = args[0];
    callback = args[1];
  } else {
    pathvars = args[0];
    params = args[1];
    callback = args[2] || none;
  }
  return [pathvars, params, callback];
}

/**
 * Constructor for create action
 * @param  {String} url          endpoint's url
 * @param  {String} name         action name
 * @param  {Object} options      action configuration
 * @param  {Object} ACTIONS      map of actions
 * @param  {[type]} fetchAdapter adapter for fetching data
 * @return {Function+Object}     action function object
 */
export default function actionFn(url, name, options, ACTIONS={}, meta={}) {
  const {actionFetch, actionSuccess, actionFail, actionReset} = ACTIONS;
  const pubsub = new PubSub();
  /**
   * Fetch data from server
   * @param  {Object}   pathvars    path vars for url
   * @param  {Object}   params      fetch params
   * @param  {Function} callback)   callback execute after end request
   */
  const fn = (...args)=> {
    const [pathvars, params, callback] = extractArgs(args);

    const urlT = urlTransform(url, pathvars);
    const syncing = params ? !!params.syncing : false;
    params && delete params.syncing;
    pubsub.push(callback);
    return (dispatch, getState)=> {
      const state = getState();
      const store = state[name];
      if (store && store.loading) {
        return;
      }

      dispatch({ type: actionFetch, syncing});
      const baseOptions = isFunction(options) ? options(urlT, params, getState) : options;
      const opts = { ...baseOptions, ...params };

      const fetchResolverOpts = {
        dispatch, getState,
        actions: meta.actions,
        prefetch: meta.prefetch
      };

      fetchResolver(0, fetchResolverOpts,
        (err)=> err ? pubsub.reject(err) : meta.holder.fetch(urlT, opts)
          .then((data)=> !meta.validation ? data :
              new Promise((resolve, reject)=> meta.validation(data,
                (err)=> err ? reject(err) : resolve(data))))
          .then((data)=> {
            dispatch({ type: actionSuccess, syncing: false, data });
            each(meta.broadcast, (btype)=> dispatch({type: btype, data}));
            pubsub.resolve(getState()[name]);
          })
          .catch((error)=> {
            dispatch({ type: actionFail, syncing: false, error });
            pubsub.reject(error);
          }));
    };
  };
  /**
   * Reset store to initial state
   */
  fn.reset = ()=> ({type: actionReset});
  /**
   * Sync store with server. In server mode works as usual method.
   * If data have already synced, data would not fetch after call this method.
   * @param  {Object} pathvars    path vars for url
   * @param  {Object} params      fetch params
   * @param  {Function} callback) callback execute after end request
   */
  fn.sync = (...args)=> {
    const [pathvars, params, callback] = extractArgs(args);
    return (dispatch, getState)=> {
      const state = getState();
      const store = state[name];
      if (!meta.holder.server && store && store.sync) {
        callback(null, store);
        return;
      }
      const modifyParams = {...params, syncing: true};
      return fn(pathvars, modifyParams, callback)(dispatch, getState);
    };
  };

  return reduce(meta.helpers, (memo, func, helpername)=> {
    if (memo[helpername]) {
      throw new Error(`Helper name: "${helpername}" for endpoint "${name}" has been already reserved`);
    }
    const {sync, call} = isFunction(func) ? {call: func} : func;
    memo[helpername] = (...args)=> (dispatch, getState)=> {
      const index = args.length - 1;
      const callback = isFunction(args[index]) ? args[index] : none;
      const helpersResult = fastApply(call, {getState, dispatch}, args);

      // If helper alias using async functionality
      if (isFunction(helpersResult)) {
        helpersResult((error, newArgs=[])=> {
          if (error) {
            callback(error);
          } else {
            fastApply(
              sync ? fn.sync : fn, null, newArgs.concat(callback)
            )(dispatch, getState);
          }
        });
      } else {
        // if helper alias is synchronous
        fastApply(
          sync ? fn.sync : fn, null, helpersResult.concat(callback)
        )(dispatch, getState);
      }
    };
    return memo;
  }, fn);
}
