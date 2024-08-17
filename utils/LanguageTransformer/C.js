const generateArrayStruct = (type) => `
typedef struct
{
  ${type}* data;
  int size;
} ArrayWithSize; \n\n
`;

const cCheckValueType = (value) => {
  const valueType = typeof value;
  switch (valueType) {
    case 'string':
      return 'char*';
    case 'number':
      return Number.isInteger(value) ? 'int' : 'float';
    case 'boolean':
      return 'bool';
    default:
      return valueType;
  }
};

const cGetExpectedValueType = ({ outputType }) => {
  let returnType = outputType;
  if (returnType === 'boolean') {
    returnType = 'bool';
  } else if (returnType === 'string') {
    returnType = 'char*';
  } else if (returnType === 'array') {
    returnType = 'ArrayWithSize';
  }

  return returnType;
};

const cGetInitialCode = ({ inputSetup, testCase, functionName, outputType }) => {
  // contains list of input param (.value, .type)
  const testCaseInput = testCase?.input;
  // return array of input parameters with C syntax, ["param1 int", "param2 char*", ...]
  const inputParams = inputSetup?.map((input, idx) => {
    const { name, type } = input;
    let params = '';
    if (type === 'array') {
      const paramValue = testCaseInput[idx];
      let parsedInputArray = JSON.parse(paramValue);
      let arrayValueType = cCheckValueType(parsedInputArray[0]);
      params = `${arrayValueType}* ${name}, int ${name}Size`;
    } else if (type === 'boolean') {
      params = `bool ${name}`;
    } else if (type === 'string') {
      params = `char* ${name}`;
    } else if (['number', 'int'].includes(type)) {
      params = `int ${name}`;
    }
    return params;
  });

  // initialize input parameters as a string
  var stringInputParams = '';
  // join the parameters if not undefined
  if (inputParams != undefined && inputParams != 'undefined') {
    stringInputParams = inputParams?.join(', ');
  }
  // get expected value type with C syntax
  const expectedValueType = cGetExpectedValueType({ outputType, testCase });
  const guideComment = '  // Write your code here and return the expected value';

  // no need to include, assume all include in other files
  let arrStruct = '';
  if (outputType === 'array') {
    let parsedExpectedArray = JSON.parse(testCase.expected);
    let parsedType = cCheckValueType(parsedExpectedArray[0]);
    arrStruct = generateArrayStruct(parsedType);
  }

  return `${arrStruct}${expectedValueType} ${functionName}(${stringInputParams}) {\n${guideComment}\n}`;
};

export default cGetInitialCode;
