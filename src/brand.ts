import { defineBrand } from './lib/brand-type';

export const brand = defineBrand({
  name: 'Flow',
  colors: { primary: '#4F46E5', primaryText: '#FFFFFF', accent: '#06B6D4' },
  screens: [
    { name: 'onboarding', title: '', hideHeader: true },
    { name: 'index', title: 'Flow' },
    { name: 'breathe', title: 'Breathe', modal: true },
  ],
});
