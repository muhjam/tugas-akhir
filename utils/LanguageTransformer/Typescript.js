const tsGetInitialReturnValue = (outputType) => {
  switch (outputType) {
    case 'string':
      return JSON.stringify('Hello world!');
    case 'int':
      return '-1';
    case 'boolean':
      return 'false';
    case 'array':
      return '[]';
    default:
      return JSON.stringify('your answer here.');
  }
};

const tsGetInitialCode = ({ inputSetup, outputType, functionName }) => {
  const inputParams = inputSetup?.map((param) => {
    if (param.type === 'int') {
      return `${param.name}: number`;
    } else if (param.type === 'array') {
      return `${param.name}: array_type[]`;
    } else {
      return `${param.name}: ${param.type}`;
    }
  });
  // initialize input parameters as a string
  var stringInputParams = '';
  // join the parameters if not undefined
  if (inputParams != undefined && inputParams != 'undefined') {
    stringInputParams = inputParams?.join(', ');
  }
  // initialize outputType as a string
  var stringOutputType = '';
  if (outputType === 'int') {
    stringOutputType = 'number';
  } else if (outputType === 'array') {
    stringOutputType = 'array_type[]';
  } else {
    stringOutputType = outputType;
  }
  // initialize guide comment & return value
  const guideComment = '// replace the return value below with your answer';
  const initialReturnValue = tsGetInitialReturnValue(outputType);

  return `function ${functionName}(${stringInputParams}): ${stringOutputType} {\n\t${guideComment}\n\treturn ${initialReturnValue};\n}`;
};

export default tsGetInitialCode;
