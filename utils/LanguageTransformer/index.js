import jsGetInitialCode from './Javascript';
import pythonGetInitialCode from './Python';
import goGetInitialCode from './Go';
import phpGetInitialCode from './Php';
import javaGetInitialCode from './Java';
import tsGetInitialCode from './Typescript';
import rubyGetInitialCode from './Ruby';
import dartGetInitialCode from './Dart';
import cppGetInitialCode from './Cpp';
import cGetInitialCode from './C';

const LanguageTransformer = ({
  language = 'javascript',
  inputSetup,
  outputType,
  functionName = 'solution',
  testCase,
}) => {
  const langTransform = {
    javascript: () => jsGetInitialCode({ inputSetup, functionName }),
    python: () => pythonGetInitialCode({ inputSetup, functionName }),
    php: () => phpGetInitialCode({ inputSetup, functionName }),
    go: () => goGetInitialCode({ inputSetup, functionName, outputType }),
    java: () => javaGetInitialCode({ inputSetup, functionName, outputType }),
    typescript: () => tsGetInitialCode({ inputSetup, functionName, outputType }),
    ruby: () => rubyGetInitialCode({ inputSetup, functionName }),
    dart: () => dartGetInitialCode({ inputSetup, functionName, outputType }),
    'c++': () => cppGetInitialCode({ inputSetup, functionName, outputType, testCase }),
    c: () => cGetInitialCode({ inputSetup, testCase, functionName, outputType }),
  };

  const transform = langTransform[language];

  if (transform) {
    const code = transform();
    return code;
  }
  return '// Intial code not available for this language';
};

export default LanguageTransformer;
