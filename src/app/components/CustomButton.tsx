import React from 'react';
import { Button } from '@mui/material';
import Image from 'next/image';

interface CustomButtonProps {
  buttonColor: string;
  textColor: string;
  text: string;
  icon: string;
  width?: string;
  onClick: () => void;
}

const CustomButton: React.FC<CustomButtonProps> = ({ buttonColor, textColor, text, icon, width, onClick }) => {
  return (
    <Button
      onClick={onClick}
      sx={{
        backgroundColor: buttonColor,
        color: textColor,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        '&:hover': {
          backgroundColor: buttonColor,
          opacity: 0.9,
        },

        width: width,
        height: 37,
        borderRadius: 30, 
        opacity: 1, 
        justifyContent: 'center',

        padding: '0 16px', 
        fontSize: '14px', 
        fontWeight: 'SemiBold', 
        fontFamily: 'Poppins, sans-serif',
        lineHeight: '40px', 
        textTransform: 'none', 
        border: buttonColor === '#000000' ? '1px solid white' : 'none',
        borderColor: '#909090',
      }}
    >
      {text}
      {icon && <Image src={icon} alt={text} width={20} height={20} />}
    </Button>
  );
};

export default CustomButton;