const convertCognitiveLevel = (cognitiveLevel) => {
  return cognitiveLevel?.split(" ")?.[0]?.toLowerCase() || cognitiveLevel;
}

export { convertCognitiveLevel };