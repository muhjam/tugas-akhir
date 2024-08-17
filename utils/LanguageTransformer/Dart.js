const dartGetInitialCode = ({ inputSetup, functionName, outputType }) => {
  const inputParams = inputSetup?.map((param) => {
    if (param.type === 'float') {
      return `double ${param.name}`;
    } else if (param.type === 'string') {
      return `String ${param.name}`;
    } else if (param.type === 'boolean') {
      return `bool ${param.name}`;
    } else if (param.type === 'array') {
      return `List<array_type> ${param.name}`;
    } else {
      return `${param.type} ${param.name}`;
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
  if (outputType === 'float') {
    stringOutputType = 'double';
  } else if (outputType === 'string') {
    stringOutputType = 'String';
  } else if (outputType === 'boolean') {
    stringOutputType = 'bool';
  } else if (outputType === 'array') {
    stringOutputType = 'List<array_type>';
  } else {
    stringOutputType = outputType;
  }

  return `${stringOutputType} ${functionName}(${stringInputParams}) {\n\n}`;
};

export default dartGetInitialCode;
