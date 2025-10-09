use FLASHCARD;

call AddUser('yonas','email','12345',@result);
select @result as result;
/*---------------Add User---------------*/


DELIMITER $$
CREATE PROCEDURE AddUser
(
IN name_ varchar(100),
IN email_ varchar(255),
IN password_hash varchar(255),
OUT userId int,
OUT result int
)
BEGIN
DECLARE name_count INT DEFAULT 0;
    DECLARE email_count INT DEFAULT 0;

    SELECT COUNT(*) INTO name_count
    FROM `User`
    WHERE `Name` = name_;

    SELECT COUNT(*) INTO email_count
    FROM `User`
    WHERE `Email` = email_;

	IF(name_count>0)
    THEN
		set userId=0;
		set result=0;
	ELSEIF (email_count >0)
    THEN
		set userId=0;
		set result=1;
    ELSE
		INSERT INTO `User`(`Name`,`Email`,`Password_hash`)
        VALUES(name_,email_,password_hash);
        set userId=LAST_INSERT_ID();
		set result =2;
	END IF;
END$$
DELIMITER ;
SHOW PROCEDURE STATUS WHERE Db = 'FLASHCARD';

/*---------------Assign Token---------------*/

DELIMITER $$

CREATE PROCEDURE AssignToken
(
IN UserId INT,
IN Token VARCHAR(255)
)
BEGIN
	UPDATE `User` SET VerifyToken=Token WHERE  `id`=UserId;
END$$

DELIMITER ;

/*---------------Verify user---------------*/

DELIMITER $$

CREATE PROCEDURE VerifyUser
(
IN User_ID INT,
IN Token VARCHAR(255),
OUT result INT
)
BEGIN
	DECLARE User_ INT;
    UPDATE `User` SET Verified=1,VerifyToken=null
    WHERE `id`=User_ID AND VerifyToken=Token;
    
    IF row_count()=1 THEN
		SET result=1;
	ELSE
		SET result=0;
	END IF;
END$$

DELIMITER ;
/*---------------Authenticate User---------------*/

DELIMITER $$

CREATE PROCEDURE CheckUser
(
    IN name_ VARCHAR(100),
    OUT password_hashIn VARCHAR(255),
    OUT userId INT,
    OUT result INT
)
BEGIN
	DECLARE Verified_ tinyint;
    SELECT id, Password_hash,Verified
    INTO userId, password_hashIn,Verified_
    FROM `User`
    WHERE `Name` = name_
    LIMIT 1;

    IF userId IS NULL THEN
        SET userId = 0;
        SET password_hashIn = NULL;
        SET result = 0;
	ELSEIF Verified_=0 THEN
		SET userId = 0;
        SET password_hashIn = NULL;
        SET result = 2;
    ELSE
        SET result = 1;
    END IF;
END$$

DELIMITER ;

/*---------------Edit User---------------*/

/*---------------update password---------------*/
DELIMITER $$
CREATE PROCEDURE UpdatePassword
(
IN id int,
IN Old_Password varchar(255),
IN New_Password varchar(255),
OUT result int)
BEGIN
	IF (EXISTS(SELECT 1 FROM `User` WHERE `id`=id AND `Password_hash`=Old_Password))
    THEN
		IF (EXISTS(SELECT 1 FROM `User` WHERE `id`=id AND `Password_hash`!=New_Password))
        THEN
			UPDATE `User` SET `Password_hash`=New_Password WHERE `id`=id;
            SET result=0;
		ELSE 
			SET result=1;
		END IF;
	ELSE
		SET result=2;
	END IF;
END$$

DELIMITER ;
/*---------------update Name---------------*/
DELIMITER $$
CREATE PROCEDURE UpdateName
(
IN id int,
IN Old_Name varchar(100),
IN New_Name varchar(100),
OUT result int)
BEGIN
	IF (EXISTS(SELECT 1 FROM `User` WHERE `id`=id AND `Password_hash`=Old_Name))
    THEN
		IF (EXISTS(SELECT 1 FROM `User` WHERE `id`=id AND `Password_hash`!=New_Name))
        THEN
			UPDATE `User` SET `Password_hash`=New_Name WHERE `id`=id;
            SET result=0;
		ELSE 
			SET result=1;
		END IF;
	ELSE
		SET result=2;
	END IF;
END$$

DELIMITER ;

/*---------------Delete User---------------*/

DELIMITER $$
CREATE PROCEDURE DeleteUser
(
IN User_id int,
OUT result int
)
BEGIN
	DELETE FROM `User` WHERE `id`=User_id;
    IF (row_count()=0)
    THEN
		SET result=0;
	ELSE 
		SET result=1;
	END IF;
END$$

DELIMITER ;

/*---------------Add Deck---------------*/

DELIMITER $$

CREATE PROCEDURE AddDeck
(
IN id int,
IN title varchar(100),
IN description_ text,
OUT pResult INT,
OUT pDeckId INT
)
BEGIN
	INSERT INTO `Deck`(`User_id`,`Title`,`Description`)
    VALUES(id,title,description_);
    SET pDeckId = LAST_INSERT_ID();
    IF(row_count()=0)
    THEN
		SET pResult=0;
	ELSE 
		SET pResult=1;
	END IF;
END$$

DELIMITER ;

/*---------------Edit Deck---------------*/

DELIMITER $$

CREATE PROCEDURE EditDeck
(
IN Deckid int,
IN title varchar(100),
IN description_ text,
OUT result int
)
BEGIN
	UPDATE  `Deck`SET `Title`=title,`Description`=description_ WHERE `id`=Deckid;
    IF(row_count()=0)
    THEN
		SET result=0;
	ELSE 
		SET result=1;
	END IF;
END$$

DELIMITER ;

/*---------------Delete Deck---------------*/

DELIMITER $$

CREATE PROCEDURE DeleteDeck
(
IN Deckid int,
OUT result int
)
BEGIN
	DELETE FROM  `Deck` WHERE `id`=Deckid;
    IF(row_count()=0)
    THEN
		SET result=0;
	ELSE 
		SET result=1;
	END IF;
END$$

DELIMITER ;
/*---------------Get Deck---------------*/

DELIMITER $$

CREATE PROCEDURE GetDeck(
in Userid int)
BEGIN
	
    select * FROM `Deck` where `User_id`=Userid;
    
END$$

DELIMITER ;

/*---------------Get Deck BY Id---------------*/

DELIMITER $$

CREATE PROCEDURE GetDeckById
(
IN deckId  int
)
BEGIN
	
    SELECT * FROM `Deck` WHERE `id`=deckId;
    
END$$

DELIMITER ;

/*---------------Add Card---------------*/

DELIMITER $$

CREATE PROCEDURE AddCard
(
IN deck_id int,
IN question text,
IN answer text,
OUT result int,
OUT CardId int)
BEGIN
	INSERT INTO `FlashCards` (`Deck_id`,`Question`,`Answer`) 
    VALUES(deck_id,question,answer);
    SET CardId=LAST_INSERT_ID();
    IF(row_count()=0)
    THEN
		SET result=0;
	ELSE
		SET result=1;
	END IF;
END$$

DELIMITER ;

/*---------------Edit Card---------------*/

DELIMITER $$

CREATE PROCEDURE EditCard
(
IN cardId int,
IN question text,
IN answer text,
OUT result int)
BEGIN
	UPDATE `FlashCards` SET `Question`=question,`Answer`=answer WHERE `id`=cardId;
    IF(row_count()=0)
    THEN
		SET result=0;
	ELSE
		SET result=1;
	END IF;
END$$

DELIMITER ;

/*---------------DELETE Card---------------*/

DELIMITER $$

CREATE PROCEDURE DelteCard
(
IN CatdId int,
OUT result int)
BEGIN
	DELETE FROM `FlashCards` WHERE `id`=CatdId;
    IF(row_count()=0)
    THEN
		SET result=0;
	ELSE
		SET result=1;
	END IF;
END$$

DELIMITER ;

/*---------------get Card---------------*/

DELIMITER $$

CREATE PROCEDURE GetCards
(
IN deckid int
)
BEGIN
	
    SELECT * FROM `FlashCards` WHERE `Deck_id`=deckid;
    
END$$

DELIMITER ;

/*---------------check answer---------------*/

DELIMITER $$

CREATE PROCEDURE CheckAnswer
(
    IN cardId INT,
    IN correct_ INT,
    OUT result INT
)
BEGIN
    UPDATE `Progress` 
    SET 
        `Attempts` = `Attempts` + 1,
        `Correct` = `Correct` + IF(correct_ = 1, 1, 0)
    WHERE `Card_id` = cardId;

    IF (ROW_COUNT() > 0) THEN
        SET result = 1;
    ELSE
        SET result = 0;
    END IF;
END$$

DELIMITER ;


/*---------------DECK ACCURACY---------------*/
DELIMITER $$
CREATE PROCEDURE AverageAccuracyOfUser
(
 IN UserId INT,
 OUT result DOUBLE
) 
BEGIN
    DECLARE Correct_,Total_ INT DEFAULT 0;
    SELECT SUM(`Correct`),SUM(`Attempts`)
    INTO Correct_,Total_
    FROM `Progress` WHERE `User_id`=UserId; 
    SET result=(Correct_/Total_)*100;
END$$

DELIMITER ;



/*---------------DECK ACCURACY---------------*/
DELIMITER $$
CREATE PROCEDURE NeedingReview
(
IN UserId INT
)
BEGIN
    SELECT `Deck_id`,AverageAccuracyOnDeck(`Deck_id`) AS AverageAccuracy
    FROM `Progress` 
    WHERE `User_id`=UserId AND AverageAccuracyOnDeck(`Deck_id`)<70 AND `Attempts`!=0; 
END$$

DELIMITER ;


