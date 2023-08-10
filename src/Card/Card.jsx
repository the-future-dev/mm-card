import React, { useState, useEffect, useRef } from "react";
import './style.css';

const useTouchHandlers = (ref, minTop, maxTop, thresholdMiddle) => {
    const initialState = { startY: 0, startSwipe: 0 };
    const [dragState, setDragState] = useState(initialState);
    const [cardTop, _setCardTop] = useState(maxTop);
    const scrollableItem = document.getElementById('scrollable-item');

    const setCardTop = (value, isTransition = false) => {
        if (ref.current) {
            ref.current.style.transition = isTransition ? 'top 0.1s ease-in-out' : '';
        }
        _setCardTop(value);
    };

    const handleEvent = (element, handlers, action = "add") => {
        Object.keys(handlers).forEach(event => 
            element[`${action}EventListener`](event, handlers[event])
        );
    };

    const handleTouchStart = event => {
        const startSwipe = event.touches[0].pageY;
        setDragState({ ...initialState, startY: startSwipe, startSwipe });
    };

    const handleTouchMove = event => {
        const currentY = event.touches[0].pageY;
        const { startSwipe, startY } = dragState;
        const swipeUp = currentY < startSwipe;
        const distance = startY - currentY;

        if (cardTop === minTop && (swipeUp || (scrollableItem && scrollableItem.scrollTop > 0))) {
            propagateScrollToChild(distance);
        } else {
            const newTop = Math.min(Math.max(cardTop - startY + currentY, minTop), maxTop);
            setCardTop(newTop, true);
        }

        setDragState(prevState => ({ ...prevState, startY: currentY }));
    };

    const handleTouchEnd = event => {
        const endY = event.changedTouches[0].pageY;
        const newTop = handleSwipeDirection(endY);
        setCardTop(newTop, true);
        setDragState(initialState);
    };

    const handleSwipeDirection = endY => {
        const { startSwipe } = dragState;
        const swipeUp = startSwipe > endY;

        return swipeUp ? (cardTop > thresholdMiddle ? thresholdMiddle : minTop) :
            (cardTop < thresholdMiddle ? thresholdMiddle : maxTop);
    };

    const propagateScrollToChild = distance => {
        if (scrollableItem) {
            scrollableItem.scrollTop += distance;
        }
    };

    const isChildOfScrollable = target => {
        let node = target;
        while (node) {
            if (node.id === 'scrollable-item') return true;
            node = node.parentNode;
        }
        return false;
    };

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const handlers = {
            touchstart: e => {
                handleTouchStart(e);
                console.log("Start");
            },
            touchmove: e => {
                const targetChildOfScrollable = isChildOfScrollable(e.target);
                if (cardTop === minTop && targetChildOfScrollable) {
                    if (scrollableItem && scrollableItem.scrollTop > 0) {
                        setDragState(prevState => ({ ...prevState, startY: e.touches[0].pageY }));
                        return;
                    }
                    console.log("Daje");
                }
                handleTouchMove(e);
            },
            touchend: e => {
                if (!(cardTop === minTop && isChildOfScrollable(e.target))) {
                    handleTouchEnd(e);
                }
                console.log("End");
            }
        };

        handleEvent(element, handlers);
        return () => handleEvent(element, handlers, "remove");
    }, [dragState, ref]);

    useEffect(() => {
        if (scrollableItem) {
            scrollableItem.classList.toggle('no-pointer-events', cardTop !== minTop);
        }
    }, [cardTop]);

    return { cardTop };
};

export default function Card({ Header, headerHeight, children }) {
    const headerRef = useRef(null);
    const cardRef = useRef(null);

    const {cardTop} = useTouchHandlers(cardRef, 0, headerHeight, headerHeight*2);

    return (
        <div 
            className={`card`}
            ref={cardRef}
            style={{top: `${cardTop}px`}}
        >
            <div
                ref={headerRef}
                className="header"
                style={{ height: `${headerHeight}px` }}
            >
                <Header headerStyle={{height: headerHeight}}/>
            </div>
            <div id='scrollable-item' className="content">
                {cardTop}
                {children}
            </div>
        </div>
    );
}
