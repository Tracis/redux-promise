import isPromise from "./isPromise";

function createReduxPromise(params = {}) {
  const { checkSuccess, getPayLoad } = params;
  return ({ dispatch, getState }) => (next) => (action) => {
    if (typeof action === "function") {
      return action(dispatch, getState, params);
    }

    const { promise, type, ...rest } = action;
    if (typeof promise !== "function" || !Array.isArray(type)) {
      return next(action);
    }

    // 如果action是type promise 这种
    // {type: [REQUEST, SUCCESS, FAILURE] , promise:()=>{}}
    const [REQUEST, SUCCESS, FAILURE] = type;
    next({ ...rest, type: REQUEST });
    const actionPromise = promise();
    if (isPromise(actionPromise)) {
      actionPromise
        .then((result) => {
          const payload =
            typeof getPayLoad === "function" ? getPayLoad(result) : result;
          if (typeof checkSuccess === "function" && !checkSuccess(result)) {
            next({ ...rest, error: result, type: FAILURE });
          } else {
            (Array.isArray(SUCCESS) ? SUCCESS : [SUCCESS]).forEach(
              (successType) => next({ ...rest, payload, type: successType })
            );
          }
        })
        .catch((error) => {
          console.error("redux error:", error);
          next({ ...rest, error, type: FAILURE });
        });
    }
    return actionPromise;
  };
}

const reduxPromise = createReduxPromise();
reduxPromise.withExtraArgument = createReduxPromise;

export default reduxPromise;
