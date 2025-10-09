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
	DECLARE DeckId INT;
    DECLARE UserId INT;
    SELECT `Deck_id` INTO DeckId FROM `FlashCards` WHERE `id`=NEW.`id`;
    SELECT `User_id` INTO UserId FROM `Deck` WHERE `id`=DeckId;
	INSERT INTO `Progress`(`Card_id`,`Deck_id`,`User_id`)
    VALUES (NEW.`id`,DeckId,UserId);
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER Add_Session
AFTER INSERT ON `Deck`
FOR EACH ROW
BEGIN
	DECLARE UserId INT;
    SELECT `User_id` INTO UserId FROM `Deck` WHERE `id`=NEW.`id`;
	INSERT INTO `Study_session`(`User_id`,`Deck_id`)
    VALUES (UserId,NEW.`id`);
END$$
DELIMITER ;