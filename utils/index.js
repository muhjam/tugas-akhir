export function sanitizeObj(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v));
}

export function formatDate(date) {
  const dateObj = new Date(date);
  if (isNaN(dateObj?.getTime())) return '-';

  return (
    new Date(date).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }) ?? '-'
  );
}

export function codeEditorLanguageTransformer(language) {
  const transform = {
    'c#': 'csharp',
    'c++': 'cpp',
  };

  return transform[language] || language;
}
