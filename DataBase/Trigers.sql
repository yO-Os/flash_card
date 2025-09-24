USE FLASHCARD;

/*---------------DELETE User Data---------------*/

DELIMITER $$
CREATE TRIGGER Delete_User_Data
BEFORE DELETE ON `User`
FOR EACH ROW 
BEGIN 
	DELETE FROM `Deck` WHERE `User_id`=OLD.`id`;
END$$
	
DELIMITER ;

DELIMITER $$
CREATE TRIGGER Delete_Deck_Data
BEFORE DELETE ON `Deck`
FOR EACH ROW 
BEGIN 
	DELETE FROM `FlashCards` WHERE `Deck_id`=OLD.`id`;
    DELETE FROM `Study_session` WHERE `Deck_id`=OLD.`id`;
END$$
	
DELIMITER ;

DELIMITER $$
CREATE TRIGGER Delete_FlashCard_Data
BEFORE DELETE ON `FlashCards`
FOR EACH ROW 
BEGIN 
	DELETE FROM `Progress` WHERE `Card_id`=OLD.`id`;
END$$
	
DELIMITER ;

/*---------------Create Deck Data---------------*/

DELIMITER $$
CREATE TRIGGER Add_progess
AFTER INSERT ON `FlashCards`
FOR EACH ROW
BEGIN
	INSERT INTO `Progress`(`Card_id`)
    VALUES (NEW.`id`);
END$$
DELIMITER ;