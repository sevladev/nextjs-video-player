import {
  IconButton as ChakraIconButton,
  Icon as ChakraIcon,
  IconButtonProps as ChakraIconButtonProps,
} from "@chakra-ui/react";
import { IconType } from "react-icons/lib";

interface IconButtonProps extends ChakraIconButtonProps {
  Icon: IconType;
}

export const IconButton = ({ Icon, ...props }: IconButtonProps) => {
  return (
    <ChakraIconButton
      icon={
        <ChakraIcon
          transition="width 0.3s ease, height 0.3s ease"
          _hover={{ w: 34, h: 34 }}
          as={Icon}
          w={26}
          h={26}
        />
      }
      bg="transparent"
      _hover={{ bg: "transparent" }}
      {...props}
    />
  );
};
