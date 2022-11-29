import { Box, HStack, VStack } from "@chakra-ui/react";
import Editor, { useMonaco } from "@monaco-editor/react";
import { Resizable, ResizableBox } from "react-resizable";
import { useContext, useEffect } from "react";

import { EditorContext } from "providers/EditorProvider";

const Main = () => {
  const monaco = useMonaco();
  const editorContext = useContext(EditorContext);

  useEffect(() => {
    if (monaco) {
      console.log("here is the monaco instance:", monaco);
    }
  }, [monaco]);

  return (
    <>
      <HStack>
        <Box>problem statement</Box>
        <VStack width="100%" height="100%">
          <Resizable height="100%" width="100%" axis="both">
            <Editor
              height="100%"
              width="100%"
              defaultLanguage={editorContext.language || "javascript"}
              language={editorContext.language}
              theme="vs-dark"
            />
          </Resizable>
          <HStack>
            <Box>output</Box>
            <Box>expected</Box>
          </HStack>
        </VStack>
      </HStack>
    </>
  );
};

export default Main;
