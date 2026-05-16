import React from 'react';
import { cn } from '@/lib/utils';

interface ListingStatusTagProps {
  status: string;
  type: string;
  isFeatured?: boolean;
  isVerified?: boolean;
  className?: string;
}

export function ListingStatusTag({ 
  status, 
  type, 
  isFeatured = false, 
  isVerified = false,
  className
}: ListingStatusTagProps) {
  console.log('ListingStatusTag props:', { status, type, isFeatured, isVerified });
  
  // If we don't need to show a tag, return null
  if (!isFeatured && !isVerified) {
    return null;
  }
  
  // Create a more visible tag
  const getTagStyle = () => {
    if (isFeatured && type === 'job') {
      return {
        text: 'FEATURED Job - VERIFIED',
        style: 'bg-blue-100 text-blue-700 font-bold px-2 py-1 text-xs rounded'
      };
    } else if (isFeatured) {
      return {
        text: 'FEATURED listing - VERIFIED',
        style: 'bg-amber-100 text-amber-700 font-bold px-2 py-1 text-xs rounded'
      };
    } else if (isVerified) {
      return {
        text: 'VERIFIED',
        style: 'bg-green-100 text-green-700 font-bold px-2 py-1 text-xs rounded'
      };
    }
    
    return { text: '', style: '' };
  };
  
  const { text, style } = getTagStyle();
  
  return (
    <span className={cn(style, className)}>
      {text}
    </span>
  );
}