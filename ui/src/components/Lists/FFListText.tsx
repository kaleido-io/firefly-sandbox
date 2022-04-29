import { Typography } from '@mui/material';

interface Props {
  color: string;
  text: string;
}

export const FFListText: React.FC<Props> = ({ color, text }) => {
  return (
    <Typography noWrap sx={{ fontWeight: '500' }} color={color} variant="body2">
      {text}
    </Typography>
  );
};
