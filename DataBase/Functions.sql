
/*---------------DECK ACCURACY---------------*/
DELIMITER $$
CREATE FUNCTION AverageAccuracyOnDeck
(
 DeckId INT
)
RETURNS DOUBLE
DETERMINISTIC 
BEGIN
	DECLARE result DOUBLE;
    DECLARE Correct_,Total_ INT DEFAULT 0;
    SELECT SUM(`Correct`),SUM(`Attempts`)
    INTO Correct_,Total_
    FROM `Progress` WHERE `Deck_id`=DeckId; 
    IF Total_=0 THEN
     SET result=100;
     ELSE 
		SET result=(Correct_/Total_)*100;
	END IF;
    RETURN result;
END$$

DELIMITER ;