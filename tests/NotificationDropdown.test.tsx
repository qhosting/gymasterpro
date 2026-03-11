import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NotificationDropdown from '../components/NotificationDropdown';
import { NotificationLog } from '../types';

describe('NotificationDropdown', () => {
  const mockNotifications: NotificationLog[] = [
    {
      id: '1',
      memberId: 'm1',
      tipo: 'Membresía por Vencer',
      mensaje: 'Mensaje de prueba',
      timestamp: 'hace 5 min',
      status: 'sent',
      read: false
    }
  ];

  const defaultProps = {
    notifications: mockNotifications,
    onMarkAsRead: vi.fn(),
    onClearAll: vi.fn(),
    onViewAll: vi.fn(),
    isOpen: true,
    onClose: vi.fn(),
  };

  it('debe renderizar correctamente cuando está abierto', () => {
    render(<NotificationDropdown {...defaultProps} />);
    expect(screen.getByText('Membresía por Vencer')).toBeInTheDocument();
    expect(screen.getByText('Mensaje de prueba')).toBeInTheDocument();
  });

  it('debe mostrar mensaje de vacío cuando no hay notificaciones', () => {
    render(<NotificationDropdown {...defaultProps} notifications={[]} />);
    expect(screen.getByText('Todo al día. No hay notificaciones.')).toBeInTheDocument();
  });

  it('debe llamar a onMarkAsRead cuando se hace click en una notificación', () => {
    render(<NotificationDropdown {...defaultProps} />);
    const notification = screen.getByText('Membresía por Vencer');
    fireEvent.click(notification.closest('div')!);
    expect(defaultProps.onMarkAsRead).toHaveBeenCalledWith('1');
  });

  it('debe llamar a onClearAll cuando se hace click en el botón de basura', () => {
    render(<NotificationDropdown {...defaultProps} />);
    const clearButton = screen.getByTitle('Limpiar todo');
    fireEvent.click(clearButton);
    expect(defaultProps.onClearAll).toHaveBeenCalled();
  });
});
