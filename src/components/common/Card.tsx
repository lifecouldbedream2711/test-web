import React from 'react';
import MuiCard, { type CardProps as MuiCardProps } from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CardActions from '@mui/material/CardActions';

interface CardProps extends MuiCardProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ 
  title, 
  subtitle, 
  actions, 
  children,
  ...props 
}) => {
  return (
    <MuiCard {...props}>
      {title && (
        <CardHeader
          title={title}
          subheader={subtitle}
        />
      )}
      <CardContent>
        {children}
      </CardContent>
      {actions && (
        <CardActions sx={{ px: 2, pb: 2 }}>
          {actions}
        </CardActions>
      )}
    </MuiCard>
  );
};
