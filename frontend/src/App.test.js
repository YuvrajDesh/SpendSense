import { render, screen } from '@testing-library/react';
import App from './App';

test('renders SpendSense login page', () => {
  render(<App />);
  const linkElement = screen.getByText(/💸 SpendSense/i);
  expect(linkElement).toBeInTheDocument();
});
