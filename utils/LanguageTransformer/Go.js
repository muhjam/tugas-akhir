const goGetInitialCode = ({ inputSetup, outputType, functionName }) => {
  const inputParams = inputSetup?.map((param) => {
    if (param.type === 'string' || param.type === 'int') {
      return `${param.name} ${param.type}`;
    } else if (param.type === 'float') {
      return `${param.name} float64`;
    } else if (param.type === 'boolean') {
      return `${param.name} bool`;
    } else if (param.type === 'array') {
      return `${param.name} []array_type`;
    }
  });
  // initialize input parameters ype as a string
  var stringInputParams = '';
  // join the parameters if not undefined
  if (inputParams != undefined && inputParams != 'undefined') {
    stringInputParams = inputParams?.join(', ');
  }
  // initialize outputType as a string
  var stringOutputType = '';
  if (outputType === 'string' || outputType === 'int') {
    stringOutputType = outputType;
  } else if (outputType === 'float') {
    stringOutputType = 'float64';
  } else if (outputType === 'boolean') {
    stringOutputType = 'bool';
  } else if (outputType === 'array') {
    stringOutputType = '[]array_type';
  }

  return `func ${functionName}(${stringInputParams}) ${stringOutputType} {\n\n}`;
};

export default goGetInitialCode;
