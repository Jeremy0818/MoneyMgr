import React, { useState } from 'react';
import '../Carousel.css';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa'; // Import icons

export function CarouselContainer({ children }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const totalSlides = React.Children.count(children);

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => Math.min(prevIndex + 1, children.length - 1));
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    };

    return (
        <div className="carousel-container">
            <div className="carousel-slide">
                {React.Children.map(children, (child, index) => {
                    const isNext = (index === (currentIndex + 1));
                    const isPrev = (index === (currentIndex - 1));
                    const isActive = index === currentIndex;

                    return React.cloneElement(child, { isActive, isNext, isPrev });
                })}
            </div>
            <div className="carousel-indicators">

            </div>
            <div className="carousel-navigation">
                <div className="carousel-button prev" onClick={prevSlide}>
                    <FaAngleLeft />
                </div>
                {React.Children.map(children, (child, index) => (
                    <div
                        key={index}
                        className={`carousel-indicator ${index === currentIndex ? 'active' : ''}`}
                        onClick={() => goToSlide(index)}
                    />
                ))}
                <div className="carousel-button next" onClick={nextSlide}>
                    <FaAngleRight />
                </div>
            </div>
        </div>
    );
}

export function CarouselItem({ children, isActive, isNext, isPrev }) {
    const slideClasses = `carousel-item ${isActive ? 'active' : ''} ${isNext ? 'next' : ''} ${isPrev ? 'prev' : ''}`;

    return (
        <div className={slideClasses}>
            {children}
        </div>
    );
}

