const findMissingParams = (params) => {
  const missingParams = Object.keys(params).filter(key => params[key] === undefined || params[key] === null)
  return missingParams.length ? missingParams : null
}

module.exports = { findMissingParams }