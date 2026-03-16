import { render, screen } from '@testing-library/react';
import { BudgetCard } from '../components/budgets/BudgetCard';
import { Provider } from 'react-redux';
import { store } from '../store';
import { MemoryRouter } from 'react-router-dom';

const makeBudget = (spent: number, limit: number) => ({
  id: '1',
  category: 'Food',
  limitAmount: limit,
  month: 3,
  year: 2026,
  spent,
  percent: Math.round((spent / limit) * 100),
});

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider store={store}><MemoryRouter>{children}</MemoryRouter></Provider>
);

describe('BudgetCard', () => {
  it('renders category name', () => {
    render(<Wrapper><BudgetCard budget={makeBudget(50, 200)} onEdit={() => {}} /></Wrapper>);
    expect(screen.getByText('Food')).toBeInTheDocument();
  });

  it('shows warning icon at 80%', () => {
    const { container } = render(<Wrapper><BudgetCard budget={makeBudget(160, 200)} onEdit={() => {}} /></Wrapper>);
    expect(container.querySelector('svg')).toBeTruthy();
  });
});
