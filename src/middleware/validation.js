export const validation = (schema) =>{
  return (req, res, next) =>{
    
    let validatorErrors = []
    for (const key of Object.keys(schema)) {
      const data = schema[key].validate(req[key], {abortEarly: false})
      if(data?.error) {
        validatorErrors.push(data?.error?.details)
      }  
    }
    if(validatorErrors.length) return res.status(400).json({error: validatorErrors})
      return next()
  }
}


