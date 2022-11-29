import { createContext, useMemo } from "react";

export const EditorContext = createContext({});

const EditorProvider = ({ children }) => {
  /* will eventually become a EditorProvider :) */
  // a editor provider holds shared information the editor

  const context = useMemo(() => {
    return {
      language: "javascript",
      theme: "vs-dark",
    };
  }, []);

  return (
    <EditorContext.Provider value={context}>{children}</EditorContext.Provider>
  );
};

export default EditorProvider;
