USE `FLASHCARD`;
CREATE TABLE `User`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `Name` VARCHAR(100) NOT NULL unique,
    `Email` VARCHAR(255) NOT NULL unique,
    `Password_hash` VARCHAR(255) NOT NULL,
    Verified TINYINT(1) DEFAULT 0,
    VerifyToken VARCHAR(255),
    `Created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `Deck`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `User_id` INT UNSIGNED NOT NULL,
    `Title` VARCHAR(100) NOT NULL,
    `Description` TEXT NOT NULL,
    FOREIGN KEY (`User_id`) REFERENCES `User`(`id`)
);
CREATE TABLE `FlashCards`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `Deck_id` INT UNSIGNED NOT NULL,
    `Question` TEXT NOT NULL,
    `Answer` TEXT NOT NULL,
    
    FOREIGN KEY (`Deck_id`) REFERENCES `Deck`(`id`)
);
CREATE TABLE `Study_session`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `User_id` INT UNSIGNED NOT NULL,
    `Deck_id` INT UNSIGNED NOT NULL,
    `Studid_at` TIMESTAMP NOT NULL default current_timestamp,
    FOREIGN KEY (`User_id`) REFERENCES `User`(`id`),
    FOREIGN KEY (`Deck_id`) REFERENCES `Deck`(`id`)
);
CREATE TABLE `Progress`(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `Card_id` INT UNSIGNED NOT NULL,
    `Deck_id` INT UNSIGNED  NOT NULL,
    `User_id` INT UNSIGNED NOT NULL,
    `Attempts` INT NOT NULL default 0,
    `Correct` INT NOT NULL default 0,
    `Last_review` TIMESTAMP NOT NULL default current_timestamp,
    FOREIGN KEY (`Card_id`) REFERENCES `FlashCards`(`id`),
    FOREIGN KEY (`Deck_id`) REFERENCES `Deck`(`id`),
    FOREIGN KEY (`User_id`) REFERENCES `User`(`id`)
    );