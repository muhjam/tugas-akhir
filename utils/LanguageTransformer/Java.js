const javaGetInitialCode = ({ inputSetup, functionName, outputType }) => {
  const inputParams = inputSetup?.map((param) => {
    if (param.type === 'array') {
      return `array_type[] ${param.name}`;
    } else if (param.type === 'string') {
      return `String ${param.name}`;
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
  if (outputType === 'array') {
    stringOutputType = 'array_type[]';
  } else if (outputType === 'string') {
    stringOutputType = 'String';
  } else {
    stringOutputType = outputType;
  }

  return `static ${stringOutputType} ${functionName}(${stringInputParams}) {\n\n}`;
};

export default javaGetInitialCode;
