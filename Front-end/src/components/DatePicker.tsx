import { useState, useRef, useEffect } from 'react';
import '../App.css';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  max?: string;
  maxDate?: Date;
  required?: boolean;
  placeholder?: string;
}

function DatePicker({ value, onChange, max, maxDate, required, placeholder }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const inputRef = useRef<HTMLInputElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      // Parse da data no formato YYYY-MM-DD
      const [year, month, day] = value.split('-').map(Number);
      setCurrentMonth(new Date(year, month - 1, day)); // month é 1-12, Date espera 0-11
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const formatDate = (dateString: string): string => {
    // Parse da data no formato YYYY-MM-DD
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month é 1-12, Date espera 0-11
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handleDateSelect = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1; // getMonth() retorna 0-11
    const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(dateString);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // getMonth() retorna 0-11
    const day = today.getDate();
    const todayString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(todayString);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  const isToday = (day: number): boolean => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number): boolean => {
    if (!value) return false;
    // Parse da data no formato YYYY-MM-DD
    const [year, month, date] = value.split('-').map(Number);
    return (
      day === date &&
      currentMonth.getMonth() === month - 1 && // month é 1-12, getMonth() retorna 0-11
      currentMonth.getFullYear() === year
    );
  };

  const isDisabled = (day: number): boolean => {
    const checkDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    
    // Verificar maxDate (Date object)
    if (maxDate) {
      if (checkDate > maxDate) return true;
    }
    
    // Verificar max (string YYYY-MM-DD) para compatibilidade
    if (max) {
      const [maxYear, maxMonth, maxDay] = max.split('-').map(Number);
      const maxDateObj = new Date(maxYear, maxMonth - 1, maxDay); // month é 1-12, Date espera 0-11
      if (checkDate > maxDateObj) return true;
    }
    
    return false;
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days: (number | null)[] = [];

  // Preencher dias do mês anterior
  const prevMonthDays = getDaysInMonth(
    new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
  );
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push(null);
  }

  // Preencher dias do mês atual
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  // Preencher dias do próximo mês para completar a grade
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push(null);
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div className="date-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          className="input date-picker"
          value={value ? formatDate(value) : ''}
          placeholder={placeholder || 'Selecione uma data'}
          readOnly
          onClick={() => setIsOpen(!isOpen)}
          required={required}
          style={{ cursor: 'pointer' }}
        />
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          max={max}
          required={required}
          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
        />
      </div>

      {isOpen && (
        <div
          ref={calendarRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '8px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            padding: '16px',
            minWidth: '300px',
            border: '1px solid #e0e0e0',
          }}
        >
          {/* Header do calendário */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <button
              type="button"
              onClick={handlePrevMonth}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
                color: '#007bff',
                padding: '4px 8px',
              }}
            >
              ‹
            </button>
            <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>
              {monthNames[currentMonth.getMonth()]} de {currentMonth.getFullYear()}
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
                color: '#007bff',
                padding: '4px 8px',
              }}
            >
              ›
            </button>
          </div>

          {/* Dias da semana */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px',
              marginBottom: '8px',
            }}
          >
            {weekDays.map((day) => (
              <div
                key={day}
                style={{
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: '12px',
                  color: '#666',
                  padding: '8px 4px',
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Grade de dias */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px',
            }}
          >
            {days.map((day, index) => {
              if (day === null) {
                return (
                  <div
                    key={`empty-${index}`}
                    style={{
                      aspectRatio: '1',
                      padding: '8px',
                    }}
                  />
                );
              }

              const isDayToday = isToday(day);
              const isDaySelected = isSelected(day);
              const isDayDisabled = isDisabled(day);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => !isDayDisabled && handleDateSelect(day)}
                  disabled={isDayDisabled}
                  style={{
                    aspectRatio: '1',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isDayDisabled ? 'not-allowed' : 'pointer',
                    backgroundColor: isDaySelected
                      ? '#007bff'
                      : isDayToday
                      ? '#e7f3ff'
                      : 'transparent',
                    color: isDaySelected
                      ? 'white'
                      : isDayDisabled
                      ? '#ccc'
                      : isDayToday
                      ? '#007bff'
                      : '#333',
                    fontWeight: isDaySelected || isDayToday ? 'bold' : 'normal',
                    fontSize: '14px',
                    transition: 'all 0.2s ease',
                    padding: '8px',
                  }}
                  onMouseEnter={(e) => {
                    if (!isDayDisabled && !isDaySelected) {
                      e.currentTarget.style.backgroundColor = '#f0f0f0';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isDayDisabled && !isDaySelected) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Botões de ação */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid #e0e0e0',
            }}
          >
            <button
              type="button"
              onClick={handleClear}
              style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                cursor: 'pointer',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Limpar
            </button>
            <button
              type="button"
              onClick={handleToday}
              style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                cursor: 'pointer',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Hoje
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DatePicker;

