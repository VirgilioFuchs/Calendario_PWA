import styles from './EventImageText.module.css';
import * as React from "react";

interface EventImageTextProps {
    imageUrl: string;
    altText: string;
    text: string | React.ReactNode;
    date: string | React.ReactNode;
    time: string | React.ReactNode;
}

export function EventImageText({imageUrl, altText, text, date, time}: EventImageTextProps) {
    return (
        <div className={styles.item}>
            <div className={styles.content}>
                <img
                    src={imageUrl}
                    alt={altText}
                    width={20}
                    height={20}
                    className={styles.image}
                />

                <span className={styles.text}>
                {text}
                </span>

                <div className={styles.datetime}>
                    <div>{date}</div>
                    <div>{time}</div>
                </div>
            </div>
        </div>
    )
}