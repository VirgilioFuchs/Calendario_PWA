// Lógica para funcionar o mouse como scroll
import { useEffect, useRef } from 'react';

export function useDragScroll<T extends HTMLElement>() {
    const ref = useRef<T>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        let isDown = false;
        let startX: number;
        let startY: number;
        let scrollLeft: number;
        let scrollTop: number;
        let hasMoved = false;

        const onMouseDown = (e: MouseEvent) => {
            isDown = true;
            hasMoved = false;
            element.classList.add('active');
            startX = e.pageX - element.offsetLeft;
            startY = e.pageY - element.offsetTop;
            scrollLeft = element.scrollLeft;
            scrollTop = element.scrollTop;
        };

        const onMouseLeave = () => {
            isDown = false;
            element.classList.remove('active');
        };

        const onMouseUp = () => {
            isDown = false;
            element.classList.remove('active');

            // Bloqueia clique se houver arraste
            if (hasMoved) {
                const preventClick = (clickE: MouseEvent) => {
                    clickE.stopPropagation();
                    window.removeEventListener('click', preventClick, true);
                };
                window.addEventListener('click', preventClick, true);
            }
        };

        const onMouseMove = (e: MouseEvent) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - element.offsetLeft;
            const y = e.pageY - element.offsetTop;
            const walkX = (x - startX);
            const walkY = (y - startY);

            if (Math.abs(walkX) > 5 || Math.abs(walkY) > 5) {
                hasMoved = true;
                element.scrollLeft = scrollLeft - walkX;
                element.scrollTop = scrollTop - walkY;
            }
        };

        element.addEventListener('mousedown', onMouseDown);
        element.addEventListener('mouseleave', onMouseLeave);
        element.addEventListener('mouseup', onMouseUp);
        element.addEventListener('mousemove', onMouseMove);

        return () => {
            element.removeEventListener('mousedown', onMouseDown);
            element.removeEventListener('mouseleave', onMouseLeave);
            element.removeEventListener('mouseup', onMouseUp);
            element.removeEventListener('mousemove', onMouseMove);
        };
    }, []);

    return ref;
}