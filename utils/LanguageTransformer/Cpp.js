const _checkTypeOfArray = (input = '[]') => {
  const items = JSON.parse(input);
  if (items.length === 0) return '-';

  const jsType = typeof items[0];
  const type = _dataType({ type: jsType });
  return type;
};

const _dataType = ({ type, input }) => {
  if (['string', 'int', 'float'].includes(type)) {
    return type;
  } else if (type === 'number') {
    return 'int';
  } else if (type === 'boolean') {
    return 'bool';
  } else if (type === 'array') {
    const arrayType = _checkTypeOfArray(input);
    return `vector<${arrayType}>`;
  }
};

const cppGetInitialCode = ({ inputSetup, outputType, functionName, testCase }) => {
  const inputParams = inputSetup?.map((param, i) => {
    const type = _dataType({ type: param.type, input: testCase.input[i] });
    return `${type} ${param.name}`;
  });

  // initialize input parameters ype as a string
  let stringInputParams = '';
  // join the parameters if not undefined
  if (inputParams != undefined && inputParams != 'undefined') {
    stringInputParams = inputParams?.join(', ');
  }

  // initialize outputType as a string
  const stringOutputType = _dataType({ type: outputType, input: testCase.expected });

  return `${stringOutputType} ${functionName}(${stringInputParams}) {\n\n}`;
};

export default cppGetInitialCode;
