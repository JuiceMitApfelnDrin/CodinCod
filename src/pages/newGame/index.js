import {
  Box,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Select,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  VStack,
} from "@chakra-ui/react";

import GeneralLayout from "layouts/GeneralLayout";
import { useState } from "react";

const Index = () => {
  const [sliderValue, setSliderValue] = useState(15);

  const labelStyles = {
    mt: "2",
    ml: "-2.5",
    fontSize: "sm",
  };

  return (
    <GeneralLayout>
      <VStack height="100vh">
        <Heading
          bgGradient="linear(to-l, heroGradientStart, heroGradientEnd)"
          bgClip="text"
          as="h1"
          size="4xl"
          pt="2rem"
        >
          Host a new game
        </Heading>
        <FormControl>
          <FormLabel color="white">Type</FormLabel>
          <Select color="white" />
          <FormHelperText color="white">
            We'll never share your email. :kappa:
          </FormHelperText>
        </FormControl>
        <Slider
          onChange={(val) => setSliderValue(val)}
          defaultValue={15}
          min={5}
          max={60}
          step={5}
        >
          <SliderMark value={5} {...labelStyles}>
            5min
          </SliderMark>
          <SliderMark value={15} {...labelStyles}>
            15min
          </SliderMark>
          <SliderMark value={30} {...labelStyles}>
            30min
          </SliderMark>
          <SliderMark value={60} {...labelStyles}>
            1hour
          </SliderMark>
          <SliderMark
            value={sliderValue}
            textAlign="center"
            bg="blue.500"
            color="white"
            mt="-10"
            ml="-5"
            w="12"
          >
            {sliderValue} minutes
          </SliderMark>
          <SliderTrack bg="red.100">
            <Box position="relative" right={10} />
            <SliderFilledTrack bg="tomato" />
          </SliderTrack>
          <SliderThumb boxSize={6} />
        </Slider>
      </VStack>
    </GeneralLayout>
  );
};

export default Index;
