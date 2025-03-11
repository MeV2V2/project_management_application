-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: fit2101-database.czg0kae4m2z9.ap-southeast-2.rds.amazonaws.com    Database: pm_database
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '';

--
-- Table structure for table `SPRINT`
--

DROP TABLE IF EXISTS `SPRINT`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SPRINT` (
  `sprint-no` int NOT NULL AUTO_INCREMENT,
  `sprint_name` varchar(50) NOT NULL,
  `sprint_goal` varchar(80) DEFAULT NULL,
  `sprint_start` date NOT NULL,
  `sprint_end` date DEFAULT NULL,
  `sprint_status` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`sprint-no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Table in order to record all things related to a particular sprint';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SPRINT`
--

LOCK TABLES `SPRINT` WRITE;
/*!40000 ALTER TABLE `SPRINT` DISABLE KEYS */;
/*!40000 ALTER TABLE `SPRINT` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TASK`
--

DROP TABLE IF EXISTS `TASK`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TASK` (
  `task_no` int NOT NULL AUTO_INCREMENT,
  `task_name` varchar(45) NOT NULL,
  `task_type` varchar(45) NOT NULL,
  `task_assignee` varchar(45) NOT NULL,
  `task_desc` text NOT NULL,
  `task_date` date NOT NULL,
  `task_status` varchar(45) NOT NULL,
  `task_priority` varchar(45) NOT NULL,
  `task_storypoint` int NOT NULL,
  `sprint_no` int DEFAULT NULL,
  PRIMARY KEY (`task_no`),
  KEY `sprint_no_idx` (`sprint_no`),
  CONSTRAINT `sprint_no` FOREIGN KEY (`sprint_no`) REFERENCES `SPRINT` (`sprint-no`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TASK`
--

LOCK TABLES `TASK` WRITE;
/*!40000 ALTER TABLE `TASK` DISABLE KEYS */;
INSERT INTO `TASK` VALUES (14,'idk','idk','Shaun','idk','2024-09-19','todo','Low',1,NULL),(15,'dik','grghr','Shaun','ehufgeyrgeeugherughrugheghegheugheugdfghruhfefbefhesghsufgbejfhgesghusfhguhfsufhs','2024-09-27','In Progress','Low',4,NULL),(17,'idk','hello','andrique','hello','2024-09-14','Started','Low',1,NULL),(20,'Andrique is dumb','Crease','guest','Andrique creased the paper ','2004-09-22','inProgress','High',1,NULL);
/*!40000 ALTER TABLE `TASK` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `USER`
--

DROP TABLE IF EXISTS `USER`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `USER` (
  `user_no` int NOT NULL AUTO_INCREMENT,
  `user_name` varchar(45) DEFAULT NULL,
  `user_email` varchar(45) DEFAULT NULL,
  `user_password` varchar(45) DEFAULT NULL,
  `user_type` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`user_no`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `USER`
--

LOCK TABLES `USER` WRITE;
/*!40000 ALTER TABLE `USER` DISABLE KEYS */;
INSERT INTO `USER` VALUES (1,'guest','user@example.com','password123','admin'),(5,'test','testing@email','test','admin');
/*!40000 ALTER TABLE `USER` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-09-25 16:03:38

INSERT INTO `TASK` (`task_name`, `task_type`, `task_assignee`, `task_desc`, `task_date`, `task_status`, `task_priority`, `task_storypoint`, `sprint_no`) VALUES
('Implement Login Feature', 'Development', 'Alice Johnson', 'Create a secure login feature with authentication.', '2024-10-20', 'In Progress', 'High', 5, 1),
('Design User Dashboard', 'Design', 'Bob Smith', 'Create mockups for the user dashboard.', '2024-10-22', 'Pending', 'Medium', 3, 1),
('Setup Database', 'Infrastructure', 'Charlie Lee', 'Configure the initial database schema.', '2024-10-18', 'Completed', 'High', 2, 1),
('Bug Fix: UI Issue', 'Bug', 'Diana Prince', 'Resolve the issue with the user interface on mobile.', '2024-10-19', 'In Progress', 'Critical', 4, 2),
('Write API Documentation', 'Documentation', 'Ethan Hunt', 'Document the REST API endpoints and usage.', '2024-10-25', 'Pending', 'Low', 1, 2),
('Conduct User Testing', 'Testing', 'Fiona Green', 'Facilitate testing sessions with users to gather feedback.', '2024-10-30', 'Pending', 'Medium', 5, NULL),
('Refactor Codebase', 'Development', 'George Washington', 'Improve code quality and maintainability.', '2024-10-27', 'In Progress', 'Medium', 8, NULL),
('Setup CI/CD Pipeline', 'DevOps', 'Hank Pym', 'Implement Continuous Integration and Continuous Deployment pipeline.', '2024-10-21', 'Pending', 'High', 5, 1),
('Create Release Notes', 'Documentation', 'Ivy League', 'Prepare release notes for the upcoming version.', '2024-10-28', 'Completed', 'Low', 2, 2),
('Optimize Performance', 'Development', 'Jack Sparrow', 'Enhance application performance and response time.', '2024-10-26', 'In Progress', 'High', 6, NULL);

