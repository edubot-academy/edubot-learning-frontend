import { useMemo } from 'react';
import {
  BRAND_COLORS,
  BRAND_GRADIENTS,
  BRAND_SHADOWS,
  BRAND_TYPHOGRAPHY,
  BRAND_SPACING,
  BRAND_BORDER_RADIUS,
  BRAND_ANIMATIONS,
  BRAND_COMPONENTS,
  getBrandColor,
  getBrandGradient,
  getBrandShadow,
} from '../config/brand';

/**
 * Hook for accessing EduBot brand configuration
 * Provides easy access to brand tokens and utilities
 */
export const useBrand = () => {
  const brand = useMemo(() => ({
    // Colors
    colors: BRAND_COLORS,
    getColor: getBrandColor,
    
    // Gradients
    gradients: BRAND_GRADIENTS,
    getGradient: getBrandGradient,
    
    // Shadows
    shadows: BRAND_SHADOWS,
    getShadow: getBrandShadow,
    
    // Typography
    typography: BRAND_TYPHOGRAPHY,
    
    // Spacing
    spacing: BRAND_SPACING,
    
    // Border Radius
    borderRadius: BRAND_BORDER_RADIUS,
    
    // Animations
    animations: BRAND_ANIMATIONS,
    
    // Component Configurations
    components: BRAND_COMPONENTS,
    
    // Utility functions
    utils: {
      // Color utilities
      primary: (opacity = 1) => getBrandColor('primary.orange', opacity),
      secondary: (opacity = 1) => getBrandColor('primary.soft', opacity),
      success: (opacity = 1) => getBrandColor('semantic.success', opacity),
      warning: (opacity = 1) => getBrandColor('semantic.warning', opacity),
      error: (opacity = 1) => getBrandColor('semantic.error', opacity),
      info: (opacity = 1) => getBrandColor('semantic.info', opacity),
      
      // Gradient utilities
      primaryGradient: () => getBrandGradient('primary'),
      successGradient: () => getBrandGradient('success'),
      darkGradient: () => getBrandGradient('dark'),
      
      // Shadow utilities
      orangeGlow: () => getBrandShadow('orangeGlow'),
      mediumShadow: () => getBrandShadow('medium'),
      largeShadow: () => getBrandShadow('large'),
      
      // Spacing utilities
      space: (value) => BRAND_SPACING[value] || '0',
      
      // Typography utilities
      fontSize: (size) => BRAND_TYPHOGRAPHY.fontSize[size] || '1rem',
      fontWeight: (weight) => BRAND_TYPHOGRAPHY.fontWeight[weight] || 400,
      
      // Border radius utilities
      rounded: (size) => BRAND_BORDER_RADIUS[size] || '0',
      
      // Animation utilities
      duration: (speed) => BRAND_ANIMATIONS.duration[speed] || '300ms',
      easing: (type) => BRAND_ANIMATIONS.easing[type] || 'easeOut',
    }
  }), []);

  return brand;
};

export default useBrand;
