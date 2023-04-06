import { useEventListener } from 'ahooks';
import { useCallback, useRef, useState } from 'react';

export const useTableSize = () => {
  const [height, setTableHeight] = useState(0);
  const [width, setTableWidth] = useState(0);
  const elementRef = useRef<HTMLDivElement>();

  const calcTableSize = useCallback(() => {
    if (!elementRef.current) return;
    const clientRect = elementRef.current.getBoundingClientRect();
    const tableHeight = Math.ceil(clientRect?.height || 0);
    const headerHeight = elementRef.current.querySelector('.ant-table-header')?.getBoundingClientRect().height || 0;
    const paginationHeight =
      elementRef.current.querySelector('.ant-table-pagination')?.getBoundingClientRect().height || 0;
    setTableWidth(clientRect.width);
    setTableHeight(tableHeight - headerHeight - paginationHeight - 16);
  }, []);

  const tableSizeRefCallback: React.RefCallback<HTMLDivElement> = (ref) => {
    elementRef.current = ref;
    calcTableSize();
  };

  useEventListener('resize', calcTableSize);

  return { height, width, tableSizeRefCallback };
};