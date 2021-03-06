import isEqual from 'lodash.isequal';

const calcObjectForPatch = (newObj, previousObj) => Object.keys(newObj).reduce((acc, prop) => {
  if (!isEqual(newObj[prop], previousObj[prop])) {
    return {
      ...acc,
      [prop]: newObj[prop],
      current_state: {
        ...acc.current_state,
        [prop]: previousObj[prop],
      },
    };
  }

  return acc;
}, { current_state: {} });

export default calcObjectForPatch;
