import React from 'react';

export interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = "Ma'lumotlar topilmadi",
  className = '',
}: DataTableProps<T>) {
  return (
    <div className="table-wrap">
      <table className={`data-table ${className}`.trim()}>
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                style={{ textAlign: col.align || 'left' }}
                className={col.className}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '36px 16px' }}>
                <span className="text-muted">{emptyMessage}</span>
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={keyExtractor(item)}>
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    style={{ textAlign: col.align || 'left' }}
                    className={col.className}
                  >
                    {col.render
                      ? col.render(item)
                      : col.accessor
                      ? String(item[col.accessor] ?? '')
                      : null}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
