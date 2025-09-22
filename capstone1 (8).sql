-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 21, 2025 at 03:51 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `capstone1`
--

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `created_by` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`id`, `title`, `content`, `created_by`, `created_at`) VALUES
(1, 'hi', 'hello', 'Unknown', '2025-09-15 11:32:31'),
(2, 'hello', 'hi', 'Unknown', '2025-09-15 11:35:18'),
(3, 'huy', 'huy', 'Unknown', '2025-09-15 11:38:27'),
(4, 'hm', 'hm', 'ADMIN_NEW', '2025-09-15 12:24:32'),
(5, 'announcement', 'announcement', 'ADMIN_NEW', '2025-09-15 12:26:55'),
(6, 'hi', 'hi', 'ADMIN_NEW', '2025-09-15 12:57:13'),
(7, 'ble', 'nye', 'bebe123', '2025-09-15 15:38:24'),
(8, 'Me', 'laihdjbwjhihd', 'ADMIN_NEW', '2025-09-19 02:25:31'),
(9, 'bab', 'sgwrgerggg', 'baba123', '2025-09-20 14:13:33');

-- --------------------------------------------------------

--
-- Table structure for table `loan_payments`
--

CREATE TABLE `loan_payments` (
  `payment_id` int(11) NOT NULL,
  `cb_number` varchar(20) NOT NULL,
  `loan_id` varchar(50) NOT NULL,
  `loan_type` enum('Regular/Agricultural','Salary','Bonuses') NOT NULL,
  `payment_method` enum('GCash','ATM','Over the Counter') NOT NULL,
  `amount_paid` decimal(12,2) NOT NULL,
  `payment_type` enum('Full Payment','Partial Payment') NOT NULL,
  `reference_number` varchar(50) NOT NULL,
  `payment_date` datetime DEFAULT current_timestamp(),
  `payment_sequence` int(11) DEFAULT 1,
  `status` enum('Pending','Completed','Failed') DEFAULT 'Pending',
  `gcash_reference` varchar(50) DEFAULT NULL,
  `gcash_fullname` varchar(100) DEFAULT NULL,
  `gcash_receipt_path` varchar(255) DEFAULT NULL,
  `atm_card_last4` varchar(4) DEFAULT NULL,
  `atm_bank` varchar(50) DEFAULT NULL,
  `atm_fullname` varchar(100) DEFAULT NULL,
  `next_deduction_date` date DEFAULT NULL,
  `otc_fullname` varchar(100) DEFAULT NULL,
  `otc_payment_date` date DEFAULT NULL,
  `otc_payment_time` time DEFAULT NULL,
  `otc_payment_method` enum('Cash','Check') DEFAULT NULL,
  `otc_check_number` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `loan_payments`
--

INSERT INTO `loan_payments` (`payment_id`, `cb_number`, `loan_id`, `loan_type`, `payment_method`, `amount_paid`, `payment_type`, `reference_number`, `payment_date`, `payment_sequence`, `status`, `gcash_reference`, `gcash_fullname`, `gcash_receipt_path`, `atm_card_last4`, `atm_bank`, `atm_fullname`, `next_deduction_date`, `otc_fullname`, `otc_payment_date`, `otc_payment_time`, `otc_payment_method`, `otc_check_number`, `created_at`, `updated_at`) VALUES
(52, 'Jen123', '6', 'Salary', 'ATM', 2583.00, 'Partial Payment', 'ATM-8550787500', '2025-08-30 21:17:35', 1, 'Completed', NULL, NULL, NULL, '5432', 'Other', 'Jenilyn Zaulda', '2025-09-06', NULL, NULL, NULL, NULL, NULL, '2025-08-30 13:17:35', '2025-09-07 15:38:50'),
(53, 'Jen123', '6', 'Salary', 'ATM', 2583.00, 'Partial Payment', 'ATM-8550781412', '2025-08-30 21:17:35', 1, 'Completed', NULL, NULL, NULL, '5432', 'Other', 'Jenilyn Zaulda', '2025-09-06', NULL, NULL, NULL, NULL, NULL, '2025-08-30 13:17:35', '2025-09-07 15:38:57'),
(54, 'Jen123', '6', 'Salary', 'ATM', 2562.00, 'Partial Payment', 'ATM-8966223655', '2025-08-30 21:18:16', 2, 'Completed', NULL, NULL, NULL, '5432', 'UnionBank', 'Jenilyn Zaulda', '2025-09-06', NULL, NULL, NULL, NULL, NULL, '2025-08-30 13:18:16', '2025-09-07 15:37:59'),
(55, 'Jen123', '6', 'Salary', 'ATM', 2562.00, 'Partial Payment', 'ATM-8966236144', '2025-08-30 21:18:16', 2, 'Completed', NULL, NULL, NULL, '5432', 'UnionBank', 'Jenilyn Zaulda', '2025-09-06', NULL, NULL, NULL, NULL, NULL, '2025-08-30 13:18:16', '2025-09-07 15:38:06'),
(56, 'Jen123', '6', 'Regular/Agricultural', 'ATM', 17917.00, 'Partial Payment', 'ATM-9365049555', '2025-08-30 21:18:56', 1, 'Failed', NULL, NULL, NULL, '5432', 'Metrobank', 'Jenilyn Zaulda', '2025-09-06', NULL, NULL, NULL, NULL, NULL, '2025-08-30 13:18:56', '2025-09-07 15:21:23'),
(57, 'Jen123', '6', 'Regular/Agricultural', 'ATM', 17917.00, 'Partial Payment', 'ATM-9365053255', '2025-08-30 21:18:56', 1, 'Completed', NULL, NULL, NULL, '5432', 'Metrobank', 'Jenilyn Zaulda', '2025-09-06', NULL, NULL, NULL, NULL, NULL, '2025-08-30 13:18:56', '2025-09-07 15:37:52'),
(58, 'Jen123', '6', 'Regular/Agricultural', 'Over the Counter', 17604.00, 'Partial Payment', 'OTC-9779549928', '2025-08-30 21:19:37', 2, 'Completed', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Jenilyn Zaulda', '2025-08-30', '08:00:00', 'Cash', NULL, '2025-08-30 13:19:37', '2025-09-07 15:06:12'),
(59, 'Jen123', '6', 'Regular/Agricultural', 'Over the Counter', 17604.00, 'Partial Payment', 'OTC-9779543377', '2025-08-30 21:19:37', 2, 'Failed', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Jenilyn Zaulda', '2025-08-30', '08:00:00', 'Cash', NULL, '2025-08-30 13:19:37', '2025-09-07 15:07:17'),
(60, 'Eman123', '4', 'Regular/Agricultural', 'GCash', 7167.00, 'Partial Payment', 'GC-8200096141', '2025-09-07 23:10:20', 1, 'Completed', '12343543', 'EMan', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-07 15:10:20', '2025-09-07 15:38:28'),
(61, 'Eman123', '4', 'Regular/Agricultural', 'GCash', 7167.00, 'Partial Payment', 'GC-8200134098', '2025-09-07 23:10:20', 1, 'Pending', '12343543', 'EMan', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-07 15:10:20', '2025-09-07 15:10:20'),
(62, 'Jen123', '6', 'Regular/Agricultural', 'Over the Counter', 17292.00, 'Partial Payment', 'OTC-6235193328', '2025-09-20 23:03:43', 3, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Jenilyn Zaulda', '2025-09-20', '16:00:00', 'Cash', NULL, '2025-09-20 15:03:43', '2025-09-20 15:03:43');

-- --------------------------------------------------------

--
-- Table structure for table `members`
--

CREATE TABLE `members` (
  `id` int(11) NOT NULL,
  `cb_number` varchar(50) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) NOT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `address` text NOT NULL,
  `dob` date NOT NULL,
  `email` varchar(255) NOT NULL,
  `gender` enum('Male','Female') NOT NULL,
  `contact_number` varchar(20) NOT NULL,
  `beneficiaries` text DEFAULT NULL,
  `emergency_name` varchar(255) NOT NULL,
  `emergency_relationship` varchar(100) NOT NULL,
  `emergency_address` text NOT NULL,
  `emergency_contact` varchar(20) NOT NULL,
  `date_issued` date DEFAULT NULL,
  `nickname` varchar(100) DEFAULT NULL,
  `civil_status` varchar(50) DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `place_of_birth` varchar(255) DEFAULT NULL,
  `nationality` varchar(100) DEFAULT NULL,
  `religion` varchar(100) DEFAULT NULL,
  `spouse_name` varchar(255) DEFAULT NULL,
  `spouse_age` int(11) DEFAULT NULL,
  `spouse_occupation` varchar(255) DEFAULT NULL,
  `father_name` varchar(255) DEFAULT NULL,
  `mother_name` varchar(255) DEFAULT NULL,
  `parent_address` text DEFAULT NULL,
  `number_of_children` int(11) DEFAULT NULL,
  `children_info` text DEFAULT NULL,
  `educational_attainment` varchar(255) DEFAULT NULL,
  `occupation` varchar(255) DEFAULT NULL,
  `other_income` varchar(255) DEFAULT NULL,
  `annual_income` decimal(15,2) DEFAULT NULL,
  `elementary_school` varchar(255) DEFAULT NULL,
  `elementary_address` varchar(255) DEFAULT NULL,
  `elementary_year_graduated` year(4) DEFAULT NULL,
  `secondary_school` varchar(255) DEFAULT NULL,
  `secondary_address` varchar(255) DEFAULT NULL,
  `secondary_year_graduated` year(4) DEFAULT NULL,
  `college_school` varchar(255) DEFAULT NULL,
  `college_address` varchar(255) DEFAULT NULL,
  `college_year_graduated` year(4) DEFAULT NULL,
  `vocational_school` varchar(255) DEFAULT NULL,
  `vocational_address` varchar(255) DEFAULT NULL,
  `vocational_year_graduated` year(4) DEFAULT NULL,
  `membership_date` date DEFAULT NULL,
  `cooperative_position` varchar(255) DEFAULT NULL,
  `emergency_contact_name` varchar(255) DEFAULT NULL,
  `emergency_contact_address` text DEFAULT NULL,
  `relation` varchar(255) DEFAULT NULL,
  `agrarian_beneficiary` enum('Yes','No') DEFAULT NULL,
  `farm_area` decimal(10,2) DEFAULT NULL,
  `farm_type` enum('Irrigated','Rainfed') DEFAULT NULL,
  `is_tenant` enum('Yes','No') DEFAULT NULL,
  `recruited_by` varchar(255) DEFAULT NULL,
  `signature` varchar(255) DEFAULT NULL,
  `signed_date` date DEFAULT NULL,
  `is_archived` tinyint(1) DEFAULT 0,
  `archived_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `members`
--

INSERT INTO `members` (`id`, `cb_number`, `first_name`, `middle_name`, `last_name`, `profile_picture`, `address`, `dob`, `email`, `gender`, `contact_number`, `beneficiaries`, `emergency_name`, `emergency_relationship`, `emergency_address`, `emergency_contact`, `date_issued`, `nickname`, `civil_status`, `age`, `place_of_birth`, `nationality`, `religion`, `spouse_name`, `spouse_age`, `spouse_occupation`, `father_name`, `mother_name`, `parent_address`, `number_of_children`, `children_info`, `educational_attainment`, `occupation`, `other_income`, `annual_income`, `elementary_school`, `elementary_address`, `elementary_year_graduated`, `secondary_school`, `secondary_address`, `secondary_year_graduated`, `college_school`, `college_address`, `college_year_graduated`, `vocational_school`, `vocational_address`, `vocational_year_graduated`, `membership_date`, `cooperative_position`, `emergency_contact_name`, `emergency_contact_address`, `relation`, `agrarian_beneficiary`, `farm_area`, `farm_type`, `is_tenant`, `recruited_by`, `signature`, `signed_date`, `is_archived`, `archived_at`) VALUES
(1, 'pot123', 'Pot', 'Pat', 'Pit', NULL, 'Sta. Rita. Calapan City', '2000-12-12', 'Pat@gmail.com', 'Male', '09517412166', NULL, '', '', '', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL),
(3, 'Lai123', 'LAIREEN', 'Alias', 'ABRIGANTE', NULL, 'Sta. Rita. ', '0000-00-00', 'laireenabrigante02@gmail.com', 'Female', '09517412165', NULL, '', 'ghrhth4edt', '', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ergethryjhefd', 'wrthyrjktuyilh', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL),
(6, 'Eman123', 'Emmanuel', 'Manalo', 'Abrigante', NULL, 'Sta. Rita Calapan ', '0000-00-00', 'laireenabrigante@gmail.com', 'Female', '09287032144', NULL, 'Myrna Abrigante', 'Wife', 'Sta. Rita. Calapan City', '09517412165', '2025-02-19', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Myrna Abrigante', 'Sta. Rita. Calapan City', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL),
(11, 'John123', 'John', 'Alias', 'Abrigante', NULL, 'SXSXX', '0000-00-00', 'laireen@gmail.com', 'Male', '09517412165', NULL, 'dfacsdc', ',/ljkhgch', 'wdfwdwdc', '09876543212', '2025-12-12', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'dfacsdc', 'wdfwdwdc', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL),
(14, 'Kai123', 'Kaizah', 'Manalo', 'Luzon', NULL, 'Sta. Rita. Calapan City', '2000-12-12', 'pangit@gmail.com', 'Female', '09517412165', NULL, 'qwdqsdq', 'qshdqsd', 'asdsadED', '09876543212', '2025-02-21', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL),
(16, 'Jen123', 'Jenilyn', 'Wangit', 'Zaulda', NULL, 'Batino Calapan, City', '2004-04-21', 'zauldajenilyn08@gmail.com', '', '09456198050', NULL, 'Cristina', 'Mother', 'Batino Calapan, City', '09365022798', '2024-12-12', 'Jen', 'Single', 20, 'Batino ', 'Filipino', 'Christian', 'sfcdc', 19, 'wfewfwf', 'Rolly', 'Christian', 'Batino Calapan, City', 3, 'fvsfaagagfsdgdb', 'ADFSFDSDF', 'fsfg', '12000', 12445.00, 'Sta. Rita. elementary School', 'Sta. Rita. Calapan City', '2015', 'Canubing Natinal High School', 'labiang 2', '2021', 'Mindoro State University', 'Masipit', '2025', 'N/A', 'labiang 2', '0000', '2024-12-12', 'member', 'reyven manalo', 'Batino Calapan, City', 'DGMGJM', 'Yes', 1.00, 'Rainfed', 'Yes', 'eefDFf', 'wfgasfgasfgfd', '2025-03-01', 0, NULL),
(18, 'Pau123', ',.kjh', 'A.', 'Abrigante', NULL, 'Sta. Rita. Calapan City', '0000-00-00', 'zauldajenilyn@gmail.com', '', '09517412165', NULL, 'ABRIGANTE, LAIREEN MAE ALIAS', 'Wife', 'Sta. Rita. Calapan City', '09517412165', '2024-12-12', 'Pau', 'Single', 21, 'Provincial', 'Filipino', 'Christian', 'sfcdc', 12, 'wfewfwf', 'Emman', 'Myrna', 'Sta. Rita. Calapan City', 2, 'oiyru6t6rditf', 'ADFSFDSDF', 'fsfg', '12000', 121344.00, 'Sta. Rita. elementary School', 'Sta. Rita. Calapan City', '2015', 'Canubing Natinal High School', 'Sta. Rita. Calapan City', '2021', 'Mindoro State University', 'Sta. Rita. Calapan', '2025', 'N/A', 'Sta. Rita. Calapan City', '0000', '2025-03-04', 'member', 'ABRIGANTE, LAIREEN MAE ALIAS', 'Sta. Rita. Calapan City', 'DGMGJM', 'Yes', 1.00, 'Irrigated', 'Yes', 'dfsgfsgfsg', 'FDFSDCFDS', '2025-03-04', 0, NULL),
(21, 'Myrna123', 'Myrna', 'Alias', 'Abrigante', NULL, 'Sta. Rita. Calapan City', '1979-12-11', 'Myrna@gmail.com', 'Female', '09517412165', NULL, 'ABRIGANTE, LAIREEN MAE ALIAS', 'Wife', 'Sta. Rita. Calapan City', '09517412165', '2024-12-12', 'Myrna', 'Single', 45, 'Provincial', 'Filipino', 'Christian', 'sfcdc', 12, 'wfewfwf', 'Emman', 'Myrna', 'Sta. Rita. Calapan City', 2, 'WgSGDbgSRgGrGsfGWG', 'ADFSFDSDF', 'fsfg', '12000', 121344.00, 'Sta. Rita. elementary School', 'Sta. Rita. Calapan City', '2015', 'Canubing Natinal High School', 'Sta. Rita. Calapan City', '2021', 'Mindoro State University', 'Sta. Rita. Calapan', '2025', 'N/A', 'Sta. Rita. Calapan City', '0000', '2025-03-12', 'member', NULL, NULL, 'DGMGJM', 'Yes', 1.00, 'Irrigated', 'Yes', 'dfsgfsgfsg', 'FDFSDCFDS', '2025-03-12', 0, NULL),
(23, 'Bhie123', 'Bhie', 'Bat', 'Manalo', NULL, 'pablo', '0000-00-00', 'Bhie@gmail.com', 'Female', '09517412165', NULL, 'ABRIGANTE, LAIREEN MAE ALIAS', 'Wifes', 'Sta. Rita. Calapan City', '09517412165', '2025-03-16', 'Bhie', 'Single', 21, 'Provincial', 'Filipino', 'Christian', 'sfcdc', 12, 'wfewfwf', 'Emman', 'Myrna', 'Sta. Rita. Calapan City', 2, 'Laireen 18\r\nMae     18', 'ADFSFDSDF', 'fsfg', '12000', 121344.00, 'Sta. Rita. elementary School', 'Sta. Rita. Calapan City', '2015', 'Canubing Natinal High School', 'Sta. Rita. Calapan City', '2021', 'Mindoro State University', 'Sta. Rita. Calapan', '2025', 'N/A', 'Sta. Rita. Calapan City', '0000', '2025-03-16', 'member', 'ABRIGANTE, LAIREEN MAE ALIAS', 'Sta. Rita. Calapan City', 'DGMGJM', 'Yes', 1.00, 'Irrigated', 'Yes', 'dfsgfsgfsg', 'FDFSDCFDS', '2025-03-16', 0, NULL),
(26, 'papa123', 'papa', 'manalo', 'Abrigante', NULL, 'Batanggas', '0000-00-00', 'zauldajenilynaxcamxc@gmail.com', 'Male', '09287032144', NULL, 'Jenilyn Wangit Zaulda', 'WFSVCDWSVCSDD', 'ascxcxzc', '09456198050', '2024-12-08', 'papa', 'Single', 21, 'Provincial', 'Filipino', 'Christian', 'eqdqdweddf', 2, 'efefdw', 'joijj', 'cdscasdc', 'xxcxz ', 6, 'axcczxczx', 'kljnhjkn', 'lkNKJKJKJ', '89890', 10000.00, 'Sta. Rita. elementary School', 'lmknlkjbjilb', '2015', 'Canubing Natinal High School', 'Sta. Rita. Calapan City', '2021', 'Mindoro State University', 'labiang 2', '2025', 'N/A', 'Batino Calapan, City', '0000', '2025-06-12', 'DK;FM;LKSJKCSDMC', 'Jenilyn Wangit Zaulda', 'ascxcxzc', 'WDFWDC', 'Yes', 1.00, 'Irrigated', 'Yes', 'DFCSDCDC', 'WDFCWDFWDC', '2025-06-07', 0, NULL),
(27, 'A123', 'A', 'A', 'A', NULL, 'sta rita b', '0000-00-00', 'A@gmail.com', 'Female', '09876543212', NULL, 'Jenilyn Wangit Zaulda', 'WFSVCDWSVCSDD', 'sta rita', '09456198050', '2024-12-08', 'A', 'Single', 21, 'Provincial', 'Filipino', 'Christian', 'eqdqdweddf', 2, 'efefdw', 'joijj', 'cdscasdc', 'sta rita', 6, 'cascsCx', 'kljnhjkn', 'lkNKJKJKJ', '89890', 10000.00, 'Sta. Rita. elementary School', 'lmknlkjbjilb', '2015', 'Canubing Natinal High School', 'Sta. Rita. Calapan City', '2021', 'Mindoro State University', 'labiang 2', '2025', 'N/A', 'Batino Calapan, City', '0000', '2025-06-12', 'DK;FM;LKSJKCSDMC', NULL, NULL, 'WDFWDC', 'Yes', 1.00, 'Irrigated', 'Yes', 'DFCSDCDC', 'WDFCWDFWDC', '2025-06-07', 0, NULL),
(28, 'BL123', 'BL', 'BL', 'BL', NULL, 'SDCKJSBGKJSHDBC', '2003-12-08', 'BL@gmail.com', 'Female', '09876543212', NULL, 'Jenilyn Wangit Zaulda', 'WFSVCDWSVCSDD', 'LKSCHKJ HJSNDC', '09456198050', '2015-08-12', 'BL', 'Single', 21, 'Provincial', 'Filipino', 'Christian', 'eqdqdweddf', 2, 'efefdw', 'joijj', 'cdscasdc', 'CKJBXAKJCBAX', 6, 'MJCBKJSB', 'kljnhjkn', 'lkNKJKJKJ', '89890', 10000.00, 'Sta. Rita. elementary School', 'lmknlkjbjilb', '2015', 'Canubing Natinal High School', 'Sta. Rita. Calapan City', '2021', 'Mindoro State University', 'labiang 2', '2025', 'N/A', 'Batino Calapan, City', '0000', '2025-06-12', 'DK;FM;LKSJKCSDMC', NULL, NULL, 'WDFWDC', 'Yes', 1.00, 'Rainfed', 'No', 'DFCSDCDC', 'WDFCWDFWDC', '2025-06-07', 0, NULL),
(29, 'BK123', 'BK', 'BK', 'BK', NULL, 'sta rita', '2003-12-08', 'BK@gmail.com', 'Male', '09876543212', NULL, 'Jenilyn Wangit Zaulda', 'WFSVCDWSVCSDD', 'sta rita', '09456198050', '2023-02-13', 'BK', 'Single', 21, 'Provincial', 'Filipino', 'Christian', 'eqdqdweddf', 2, 'efefdw', 'joijj', 'cdscasdc', 'sta rita', 6, ',MNSDKFJPIOERG POFJG', 'kljnhjkn', 'lkNKJKJKJ', '89890', 10000.00, 'Sta. Rita. elementary School', 'lmknlkjbjilb', '2015', 'Canubing Natinal High School', 'Sta. Rita. Calapan City', '2021', 'Mindoro State University', 'labiang 2', '2025', 'N/A', 'Batino Calapan, City', '0000', '2025-06-12', 'DK;FM;LKSJKCSDMC', NULL, NULL, 'WDFWDC', 'Yes', 1.00, 'Rainfed', 'Yes', 'DFCSDCDC', 'WDFCWDFWDC', '2025-06-07', 0, NULL),
(30, 'BM123', 'BM', 'BM', 'BM', NULL, '.,CNSMNKD', '2003-12-08', 'BM@gmail.com', 'Male', '09876543212', NULL, 'Jenilyn Wangit Zaulda', 'WFSVCDWSVCSDD', 'Batino Calapan, City', '09456198050', '2023-04-29', 'BM', 'Single', 21, 'Provincial', 'Filipino', 'Christian', 'eqdqdweddf', 2, 'efefdw', 'joijj', 'cdscasdc', 'Batino Calapan, City', 6, 'DSDC DCSDC', 'kljnhjkn', 'lkNKJKJKJ', '89890', 10000.00, 'Sta. Rita. elementary School', 'lmknlkjbjilb', '2015', 'Canubing Natinal High School', 'Sta. Rita. Calapan City', '2021', 'Mindoro State University', 'labiang 2', '2025', 'N/A', 'Batino Calapan, City', '0000', '2025-06-12', 'DK;FM;LKSJKCSDMC', NULL, NULL, 'WDFWDC', 'Yes', 1.00, 'Irrigated', 'Yes', 'DFCSDCDC', 'WDFCWDFWDC', '2025-06-07', 0, NULL),
(31, 'BM1234', 'BM', 'BM', 'BM', NULL, 'dvsvdvc', '2003-12-08', 'zaulda8@gmail.com', 'Female', '09876543212', NULL, 'Jenilyn Wangit Zaulda', 'WFSVCDWSVCSDD', 'lkmnljbjbljbj knokjn', '09456198050', '2023-04-29', 'BM', 'Single', 21, 'Provincial', 'Filipino', 'Christian', 'eqdqdweddf', 2, 'efefdw', 'joijj', 'cdscasdc', 'lkhlijuifiygpiuh', 6, 'k,hfydfdtfyl;oih;oi uubo', 'kljnhjkn', 'lkNKJKJKJ', '89890', 10000.00, 'Sta. Rita. elementary School', 'lmknlkjbjilb', '2015', 'Canubing Natinal High School', 'Sta. Rita. Calapan City', '2021', 'Mindoro State University', 'labiang 2', '2025', 'N/A', 'Batino Calapan, City', '0000', '2025-06-12', 'DK;FM;LKSJKCSDMC', NULL, NULL, 'WDFWDC', 'Yes', 1.00, 'Rainfed', 'Yes', 'DFCSDCDC', 'WDFCWDFWDC', '2025-06-07', 0, NULL),
(32, 'BM12346', 'BM', 'BM', 'BM', NULL, '.,CNSMNKD', '2003-12-08', 'zaulduhygiyug@gmail.com', 'Male', '09876543212', NULL, 'Jenilyn Wangit Zaulda', 'WFSVCDWSVCSDD', '.,CNSMNKD', '09456198050', '2023-04-29', 'BM', 'Single', 21, 'Provincial', 'Filipino', 'Christian', 'eqdqdweddf', 2, 'efefdw', 'joijj', 'cdscasdc', '.,CNSMNKD', 6, 'mnvkgyguo;kh;k', 'kljnhjkn', 'lkNKJKJKJ', '89890', 10000.00, 'Sta. Rita. elementary School', 'lmknlkjbjilb', '2015', 'Canubing Natinal High School', 'Sta. Rita. Calapan City', '2021', 'Mindoro State University', 'labiang 2', '2025', 'N/A', 'Batino Calapan, City', '0000', '2025-06-12', 'DK;FM;LKSJKCSDMC', NULL, NULL, 'WDFWDC', 'Yes', 1.00, 'Irrigated', 'Yes', 'DFCSDCDC', 'WDFCWDFWDC', '2025-06-07', 0, NULL),
(34, 'BM12345', 'BM', 'BM', 'BM', NULL, 'xvhfxhnfn srgbsbsd ', '2003-12-08', 'zauldxKJxjk@gmail.com', 'Male', '09876543212', NULL, 'Jenilyn Wangit Zaulda', 'WFSVCDWSVCSDD', 'xvbxgdb f dfb', '09456198050', '2023-04-29', 'BM', 'Single', 21, 'Provincial', 'Filipino', 'Christian', 'eqdqdweddf', 2, 'efefdw', 'joijj', 'cdscasdc', 'xdghdgghf srnrsg ', 6, 'dbsrtrba agbsesd  ', 'kljnhjkn', 'lkNKJKJKJ', '89890', 10000.00, 'Sta. Rita. elementary School', 'lmknlkjbjilb', '2015', 'Canubing Natinal High School', 'Sta. Rita. Calapan City', '2021', 'Mindoro State University', 'labiang 2', '2025', 'N/A', 'Batino Calapan, City', '0000', '2025-06-12', 'DK;FM;LKSJKCSDMC', NULL, NULL, 'WDFWDC', 'Yes', 1.00, 'Irrigated', 'Yes', 'DFCSDCDC', 'WDFCWDFWDC', '2025-06-07', 0, NULL),
(35, 'baba123', 'LAIREEN', 'MAE ALIAS', 'ABRIGANTE', NULL, 'Sta. Rita. Calapan City', '2003-12-08', 'zauldajenil@gmail.com', 'Male', '09517412165', NULL, 'reyven manalo', 'mnvbnhcxchkjl;', 'labiang 2', '09365022798', '2022-08-08', 'papa', 'Single', 21, 'jhcdjdajcbjlc', 'lkcndslknscnslkcnksd', 'knclkdncslkcnkd', ',mnkcv v', 3, 'ijqediaefj', 'ladnflkanfda', ',admlanafd', 'mnflsnl.wnfrj', 3, 'qrokjek;ofhwekfhj;', 'm.dnsfsfn;lkfn;s', 'lkNKJKJKJ', '89890', 10000.00, 'Sta. Rita. elementary School', 'labiang 2', '2015', 'Canubing Natinal High School', 'Batino Calapan, City', '2021', 'Mindoro State University', 'Naujan Aurora', '2025', 'N/A', 'labiang 2', '0000', '2025-07-11', 'DK;FM;LKSJKCSDMC', NULL, NULL, 'WDFWDC', 'No', 1.00, 'Irrigated', 'No', 'dfsgfsgfsg', '.klhgxczvcgfhlip', '2025-07-22', 0, NULL),
(36, 'bebe123', 'LAIREEN', 'MAE ALIAS', 'ABRIGANTE', NULL, 'Batino Calapan, City', '2003-12-08', 'z@gmail.com', 'Male', '09517412165', NULL, 'reyven manalo', 'mnvbnhcxchkjl;', 'Batino Calapan, City', '09365022798', '2025-07-20', 'papa', 'Single', 21, 'jhcdjdajcbjlc', 'lkcndslknscnslkcnksd', 'knclkdncslkcnkd', ',mnkcv v', 3, 'ijqediaefj', 'ladnflkanfda', ',admlanafd', 'Batino Calapan, City', 3, 'wedwcwdc', 'm.dnsfsfn;lkfn;s', 'lkNKJKJKJ', '89890', 10000.00, 'Sta. Rita. elementary School', 'labiang 2', '2015', 'Canubing Natinal High School', 'Batino Calapan, City', '2021', 'Mindoro State University', 'Naujan Aurora', '2025', 'N/A', 'labiang 2', '0000', '2025-07-11', 'DK;FM;LKSJKCSDMC', NULL, NULL, 'WDFWDC', 'No', 1.00, 'Rainfed', 'No', 'dfsgfsgfsg', '.klhgxczvcgfhlip', '2025-07-22', 0, NULL),
(37, 'sese123', 'LAIREEN', 'MAE ALIAS', 'ABRIGANTE', NULL, 'labiang 2', '2003-12-08', 'jhhb08@gmail.com', 'Male', '09517412165', NULL, 'reyven manalo', 'ASDSC', 'labiang 2', '09365022798', '2025-08-05', '.,vms/vnsv', 'Single', 21, 'Provincial', 'Filipino', 'Christian', 'sfcdc', 2, 'efefdw', 'dfsdgfsgas', 'dfSDF', 'labiang 2', 2, 'lfghij;ak;k;', 'lsmv;lsmlmflv', 'lkNKJKJKJ', '89890', 12000.00, 'Sta. Rita. elementary School', 'sta rita', '2015', 'Canubing Natinal High School', 'labiang 2', '2021', 'Mindoro State University', 'Naujan Aurora', '2025', 'N/A', 'khjcgh', '0000', '2024-12-12', 'DK;FM;LKSJKCSDMC', NULL, NULL, 'DFdfDF', 'Yes', 1.00, 'Irrigated', 'Yes', 'dfsgfsgfsg', 'hjvfghjpk[[pojhj', '2025-08-05', 0, NULL),
(38, 'nene123', 'Jenilyn', 'Wangit', 'Zaulda', NULL, 'Batino Calapan, City', '2004-12-12', 'mae@gmail.com', 'Female', '09456198050', NULL, 'ABRIGANTE, LAIREEN MAE ALIAS', 'mnvbnhcxchkjl;', 'Sta. Rita. Calapan City', '09517412165', '2925-08-16', 'Lai', 'Single', 20, 'Dec 08, 2003', 'Filipino', 'Christian', 'Cristina', 12, 'ijqediaefj', 'dfdf', 'asasf', 'Sta. Rita. Calapan City', 1, 'ljkhdhdhkjkwq\r\nppdkm', 'kljnhjkn', 'lkNKJKJKJ', '12000', 12000.00, 'Sta. Rita. elementary School', 'Sta. Rita. Calapan City', '2015', 'Canubing Natinal High School', 'Sta. Rita. Calapan City', '2021', 'Mindoro State University', 'Batino Calapan, City', '2025', 'N/A', 'Sta. Rita. Calapan City', '0000', '2025-08-15', 'member', NULL, NULL, 'DFdfDF', 'Yes', 1.00, 'Irrigated', 'Yes', 'DFCSDCDC', 'l;hghfcf', '2025-08-16', 0, NULL),
(48, 'Kim123', 'LAIREEN', 'MAE ALIAS', 'ABRIGANTE', '/uploads/profile-pictures/profile-1758377182693-344745929.webp', 'Batino Calapan, City', '2003-08-12', 'kim@gmail.com', 'Female', '09517412165', '[\"SDCSDC\",\"SDCSDC\"]', 'Emmanuel Manalo Abrigante', 'Father', 'Batino Calapan, City', '09287032144', '2024-09-20', 'kim', 'Single', 22, 'Provincial', 'Filipino', 'Christian', 'eqdqdweddf', 1, 'farmer', 'Emmanuel A. Abrigante', 'Myrna Abrigante', 'Batino Calapan, City', 2, 'lkshlkfjekjsgwr', 'lsmv;lsmlmflv', 'lkNKJKJKJ', '1200', 12000.00, 'Sta. Rita. elementary School', 'Sta. Rita. Calapan City', '2015', 'Canubing Natinal High School', 'Sta. Rita. Calapan City', '2021', 'Mindoro State University', 'Sta. Rita. Calapan City', '2025', 'N/A', 'Sta. Rita. Calapan City', '2025', '2025-09-20', 'member', 'ABRIGANTE, LAIREEN MAE ALIAS', 'Batino Calapan, City', 'jklknkljn', 'No', 1.00, 'Rainfed', 'No', 'DFCSDCDC', 'mnhgcffhgjk', '2025-09-20', 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `member_savings`
--

CREATE TABLE `member_savings` (
  `savings_id` int(11) NOT NULL,
  `cb_number` varchar(50) NOT NULL,
  `balance` decimal(12,2) DEFAULT 0.00,
  `last_updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_rejections`
--

CREATE TABLE `payment_rejections` (
  `id` int(11) NOT NULL,
  `payment_id` int(11) NOT NULL,
  `reason` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payment_rejections`
--

INSERT INTO `payment_rejections` (`id`, `payment_id`, `reason`, `created_at`) VALUES
(1, 59, 'mali ang amount', '2025-09-07 15:07:17'),
(2, 56, 'klnfkjhkpjf', '2025-09-07 15:21:23');

-- --------------------------------------------------------

--
-- Table structure for table `regular_agricultural_loans`
--

CREATE TABLE `regular_agricultural_loans` (
  `cb_number` varchar(50) NOT NULL,
  `application_no` varchar(50) NOT NULL,
  `application_date` date NOT NULL,
  `spouse_name` varchar(100) DEFAULT NULL,
  `member_address` text NOT NULL,
  `contact_number` varchar(20) NOT NULL,
  `account_number` varchar(50) DEFAULT NULL,
  `coop_id_number` varchar(50) DEFAULT NULL,
  `loan_type` varchar(50) DEFAULT 'Regular/Agricultural',
  `loan_amount` decimal(12,2) NOT NULL,
  `annual_income` decimal(12,2) DEFAULT NULL,
  `income_source` varchar(100) DEFAULT NULL,
  `collateral` varchar(100) DEFAULT NULL,
  `loan_purpose` text DEFAULT NULL,
  `paid_up_capital` decimal(12,2) DEFAULT NULL,
  `previous_loan_amount` decimal(12,2) DEFAULT NULL,
  `outstanding_balance` decimal(12,2) DEFAULT NULL,
  `cbu_status` enum('Updated','Not Updated') NOT NULL,
  `borrower_type` enum('New Member','New Borrower','Old Member','Old Borrower') NOT NULL,
  `loan_status` enum('With O/B Balance','Current','Restructured','Past Due','Others') NOT NULL,
  `application_status` enum('Pending','Approved','Disapproved','Released') DEFAULT 'Pending',
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `regular_agricultural_loans`
--

INSERT INTO `regular_agricultural_loans` (`cb_number`, `application_no`, `application_date`, `spouse_name`, `member_address`, `contact_number`, `account_number`, `coop_id_number`, `loan_type`, `loan_amount`, `annual_income`, `income_source`, `collateral`, `loan_purpose`, `paid_up_capital`, `previous_loan_amount`, `outstanding_balance`, `cbu_status`, `borrower_type`, `loan_status`, `application_status`, `date_created`, `last_updated`) VALUES
('Jen123', '111', '2025-03-30', 'sfcdc', 'dvafdv', '09517412165', '098', '551', 'Regular/Agricultural', 10000.00, 121344.00, 'work', '24424', 'Emergency', 12000.00, 10000.00, 1000.00, 'Updated', 'New Member', 'With O/B Balance', 'Approved', '2025-03-30 14:00:11', '2025-08-16 14:33:31'),
('Eman123', '133', '2025-05-12', 'dvcsd', 'Sta. Rita. Calapan City', '09517412165', '111', '123', 'Regular/Agricultural', 120000.00, 1200.00, '1200', '24424', 'Emergency', 500.00, 1000.00, 100.00, 'Updated', 'New Member', 'With O/B Balance', 'Approved', '2025-05-12 01:23:17', '2025-09-19 04:05:47'),
('Jen123', '174', '2025-03-30', 'sfcdc', 'Sta ', '09517412165', '098', '551', 'Regular/Agricultural', 10000.00, 121344.00, 'work', '24424', 'Farm Equipment', 12000.00, 10000.00, 1000.00, 'Updated', 'New Member', 'With O/B Balance', 'Approved', '2025-03-30 14:46:49', '2025-08-16 14:33:31'),
('Myrna123', '177', '2025-03-30', 'sfcdc', 'sTA', '09517412165', '098', '551', 'Regular/Agricultural', 10000.00, 121344.00, 'work', '24424', 'Others', 12000.00, 10000.00, 1000.00, 'Updated', 'New Member', 'With O/B Balance', 'Pending', '2025-03-30 15:38:01', '2025-03-30 15:38:01'),
('Jen123', '237', '2025-03-30', 'sfcdc', 'Sta rita ', '09517412165', '098', '551', 'Regular/Agricultural', 10000.00, 121344.00, 'work', '24424', 'Others', 12000.00, 10000.00, 1000.00, 'Updated', 'New Member', 'With O/B Balance', 'Approved', '2025-03-30 14:35:50', '2025-08-16 14:33:31'),
('Jen123', '300', '2025-04-20', 'kghkgkj', 'Calapan', '09456198050', '98', '551', 'Regular/Agricultural', 100000.00, 200000.00, 'work', 'adcsdsdvdsvc', 'Emergency', 300.00, 50000.00, 100000.00, 'Updated', 'New Member', 'With O/B Balance', 'Approved', '2025-04-20 00:53:50', '2025-08-16 14:33:31'),
('Jen123', '301', '2025-04-20', 'kghkgkj', 'Calapan', '09456198050', '098', '551', 'Regular/Agricultural', 100000.00, 100000.00, 'work', 'adcsdsdvdsvc', 'Others', 12000.00, 50000.00, 20000.00, 'Updated', 'New Member', 'With O/B Balance', 'Approved', '2025-04-20 01:18:52', '2025-08-16 14:33:31');

-- --------------------------------------------------------

--
-- Table structure for table `regular_agricultural_transaction`
--

CREATE TABLE `regular_agricultural_transaction` (
  `transaction_id` int(11) NOT NULL,
  `cb_number` varchar(50) NOT NULL,
  `property_value` decimal(12,2) NOT NULL,
  `max_loan_amount` decimal(12,2) NOT NULL,
  `loan_application_type` enum('new','renew') NOT NULL,
  `loan_amount` decimal(12,2) NOT NULL,
  `previous_balance` decimal(12,2) NOT NULL DEFAULT 0.00,
  `new_balance` decimal(12,2) NOT NULL,
  `service_fee` decimal(12,2) NOT NULL,
  `processing_fee` decimal(12,2) NOT NULL,
  `total_deductions` decimal(12,2) NOT NULL,
  `total_loan_received` decimal(12,2) NOT NULL,
  `member_fee` decimal(12,2) NOT NULL,
  `share_capital` decimal(12,2) NOT NULL,
  `bayanihan_savings` decimal(12,2) NOT NULL DEFAULT 0.00,
  `advance_interest` decimal(12,2) NOT NULL,
  `total_or_amount` decimal(12,2) NOT NULL,
  `take_home_amount` decimal(12,2) NOT NULL,
  `transaction_date` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `regular_agricultural_transaction`
--

INSERT INTO `regular_agricultural_transaction` (`transaction_id`, `cb_number`, `property_value`, `max_loan_amount`, `loan_application_type`, `loan_amount`, `previous_balance`, `new_balance`, `service_fee`, `processing_fee`, `total_deductions`, `total_loan_received`, `member_fee`, `share_capital`, `bayanihan_savings`, `advance_interest`, `total_or_amount`, `take_home_amount`, `transaction_date`) VALUES
(4, 'Eman123', 1000000.00, 250000.00, 'new', 100000.00, 0.00, 100000.00, 3000.00, 1000.00, 4000.00, 96000.00, 500.00, 5000.00, 0.00, 3000.00, 8500.00, 87500.00, '2025-08-11 21:55:53'),
(5, 'Myrna123', 1000000.00, 250000.00, 'new', 175000.00, 0.00, 175000.00, 5250.00, 1750.00, 7000.00, 168000.00, 500.00, 8750.00, 500.00, 5250.00, 15000.00, 153000.00, '2025-08-11 22:00:37'),
(6, 'Jen123', 2000000.00, 500000.00, 'new', 250000.00, 0.00, 250000.00, 7500.00, 2500.00, 10000.00, 240000.00, 500.00, 12500.00, 0.00, 7500.00, 20500.00, 219500.00, '2025-08-11 22:13:52');

-- --------------------------------------------------------

--
-- Table structure for table `salary_bonuses_loans`
--

CREATE TABLE `salary_bonuses_loans` (
  `cb_number` varchar(50) NOT NULL,
  `application_no` varchar(50) NOT NULL,
  `application_date` date NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `middle_initial` varchar(10) DEFAULT NULL,
  `municipality` varchar(100) DEFAULT NULL,
  `position` varchar(100) NOT NULL,
  `length_of_service` int(11) DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `address` text NOT NULL,
  `office_agency` varchar(150) DEFAULT NULL,
  `basic_monthly_salary` decimal(12,2) DEFAULT NULL,
  `net_take_home_pay` decimal(12,2) DEFAULT NULL,
  `spouse_name` varchar(100) DEFAULT NULL,
  `contact_no` varchar(20) NOT NULL,
  `loan_type` enum('New','Salary Loan','Renewal','Bonus') NOT NULL,
  `loan_amount` decimal(12,2) NOT NULL,
  `application_status` enum('Pending','Approved','Disapproved','Released') DEFAULT 'Pending',
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `salary_bonuses_loans`
--

INSERT INTO `salary_bonuses_loans` (`cb_number`, `application_no`, `application_date`, `last_name`, `first_name`, `middle_initial`, `municipality`, `position`, `length_of_service`, `age`, `address`, `office_agency`, `basic_monthly_salary`, `net_take_home_pay`, `spouse_name`, `contact_no`, `loan_type`, `loan_amount`, `application_status`, `date_created`, `last_updated`) VALUES
('Eman123', '122', '2025-05-12', 'Abrigante', 'Emmanuel', 'M', 'Calapan', 'member', 3, 45, 'Sta. Rita. Calapan City', 'Cristina', 12000.00, 2000.00, 'Cristina', '09517412165', 'Salary Loan', 120000.00, 'Approved', '2025-05-12 01:14:49', '2025-09-19 04:07:52'),
('Jen123', '125', '2025-07-03', 'Abrigante', 'Emmanuel', 'M', 'Calapan', 'member', 3, 45, 'Batino Calapan, City', 'Cristina', 12000.00, 2000.00, 'Cristina', '09517412165', 'Salary Loan', 120000.00, 'Approved', '2025-07-03 23:29:45', '2025-08-16 15:39:08'),
('Myrna123', '131', '2025-03-30', 'Abrigante', 'Myrna', 'ALIAS', 'Calapan', 'member', 3, 45, 'Sta. Rita. Calapan City', 'ABRIGANTE, LAIREEN MAE ALIAS', 12000.00, 10000.00, 'sfcdc', '09517412165', 'Bonus', 10000.00, 'Approved', '2025-03-30 15:37:07', '2025-08-16 15:42:24'),
('Jen123', '302', '2025-04-20', 'Zaulda', 'Jenilyn', 'Wangit', 'Calapan', 'member', 1, 62, 'Balanga Batino Calapan City Oriental Mindoro', 'HGJFDY', 15000.00, 15000.00, 'kghkgkj', '09456198050', 'Salary Loan', 75000.00, 'Approved', '2025-04-20 01:42:01', '2025-08-16 15:39:08'),
('Jen123', '4562', '2025-03-30', 'Abrigante', 'Myrna', 'ALIAS', 'Calapan', 'member', 3, 45, 'Sta. Rita. Calapan City', 'ABRIGANTE, LAIREEN MAE ALIAS', 12000.00, 10000.00, 'sfcdc', '09517412165', 'Salary Loan', 10000.00, 'Approved', '2025-03-30 14:46:17', '2025-08-16 15:39:08'),
('Jen123', '500', '2025-04-20', 'Zaulda', 'Jenilyn', 'Wangit', 'Calapan', 'member', 3, 20, 'Balanga Batino Calapan City Oriental Mindoro', 'HGJFDY', 50000.00, 45000.00, 'kghkgkj', '09456198050', 'Salary Loan', 100000.00, 'Approved', '2025-04-20 00:34:55', '2025-08-16 15:39:08'),
('Jen123', '555', '2025-07-04', 'Zaulda', 'Jenilyn', 'W', 'Calapan', 'member', 2, 22, 'Batino Calapan, City', 'Jenilyn Wangit Zaulda', 12000.00, 10000.00, 'Jenilyn Wangit Zaulda', '09456198050', 'Salary Loan', 150000.00, 'Approved', '2025-07-04 07:03:53', '2025-08-16 15:39:08'),
('Jen123', '678', '2025-07-04', 'Abrigante', 'Emmanuel', 'M', 'Calapan', 'member', 3, 45, 'Sta. Rita. Calapan City', 'Cristina', 12000.00, 2000.00, 'Cristina', '09517412165', 'Salary Loan', 120000.00, 'Approved', '2025-07-04 07:05:08', '2025-08-16 15:39:08'),
('Jen123', '7886', '2025-07-04', 'Abrigante', 'Emmanuel', 'M', 'Calapan', 'member', 3, 45, 'Sta. Rita. Calapan City', 'Cristina', 12000.00, 2000.00, 'Cristina', '09517412165', 'Salary Loan', 120000.00, 'Approved', '2025-07-04 07:05:39', '2025-08-16 15:39:08'),
('Jen123', '9755', '2025-07-04', 'Zaulda', 'Jenilyn', 'W', 'Calapan', 'member', 2, 22, 'Batino Calapan, City', 'Jenilyn Wangit Zaulda', 12000.00, 2000.00, 'Jenilyn Wangit Zaulda', '09517412165', 'Salary Loan', 120000.00, 'Approved', '2025-07-04 07:24:26', '2025-08-16 15:39:08');

-- --------------------------------------------------------

--
-- Table structure for table `salary_loan_transactions`
--

CREATE TABLE `salary_loan_transactions` (
  `id` int(11) NOT NULL,
  `cb_number` varchar(20) NOT NULL,
  `loan_type` enum('salary','bonuses') NOT NULL,
  `loan_amount` decimal(12,2) NOT NULL,
  `previous_balance` decimal(12,2) NOT NULL,
  `new_balance` decimal(12,2) NOT NULL,
  `service_fee` decimal(12,2) NOT NULL,
  `processing_fee` decimal(12,2) NOT NULL,
  `total_deductions` decimal(12,2) NOT NULL,
  `total_loan_received` decimal(12,2) NOT NULL,
  `loan_application_type` enum('new','renew') NOT NULL,
  `member_fee` decimal(12,2) NOT NULL,
  `share_capital` decimal(12,2) NOT NULL,
  `bayanihan_savings` decimal(12,2) NOT NULL,
  `cbu` decimal(12,2) DEFAULT 0.00,
  `interest_fee` decimal(12,2) DEFAULT 0.00,
  `total_or_amount` decimal(12,2) NOT NULL,
  `take_home_amount` decimal(12,2) NOT NULL,
  `transaction_date` datetime DEFAULT current_timestamp(),
  `bonus_type` enum('midYear','yearEnd','both') DEFAULT NULL,
  `mid_year_amount` decimal(12,2) DEFAULT NULL,
  `year_end_amount` decimal(12,2) DEFAULT NULL,
  `mid_year_interest` decimal(12,2) DEFAULT NULL,
  `year_end_interest` decimal(12,2) DEFAULT NULL,
  `total_interest` decimal(12,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `salary_loan_transactions`
--

INSERT INTO `salary_loan_transactions` (`id`, `cb_number`, `loan_type`, `loan_amount`, `previous_balance`, `new_balance`, `service_fee`, `processing_fee`, `total_deductions`, `total_loan_received`, `loan_application_type`, `member_fee`, `share_capital`, `bayanihan_savings`, `cbu`, `interest_fee`, `total_or_amount`, `take_home_amount`, `transaction_date`, `bonus_type`, `mid_year_amount`, `year_end_amount`, `mid_year_interest`, `year_end_interest`, `total_interest`) VALUES
(4, 'Eman123', 'salary', 200000.00, 0.00, 200000.00, 4000.00, 2000.00, 6000.00, 194000.00, 'new', 500.00, 10000.00, 1000.00, 0.00, NULL, 11500.00, 182500.00, '2025-05-13 15:14:07', NULL, NULL, NULL, NULL, NULL, NULL),
(6, 'Jen123', 'salary', 50000.00, 0.00, 50000.00, 1000.00, 500.00, 1500.00, 48500.00, 'new', 500.00, 2500.00, 500.00, 0.00, NULL, 3500.00, 45000.00, '2025-08-16 23:39:08', NULL, NULL, NULL, NULL, NULL, NULL),
(7, 'Myrna123', 'bonuses', 170000.00, 0.00, 170000.00, 3400.00, 0.00, 3400.00, 166600.00, '', 0.00, 0.00, 0.00, 1000.00, 8386.67, 9386.67, 157213.33, '2025-08-16 23:39:50', 'midYear', 170000.00, NULL, 8386.67, NULL, 8386.67);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `cb_number` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','member','clerk','cashier') NOT NULL DEFAULT 'member',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reset_token` varchar(255) DEFAULT NULL,
  `profile_picture` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `cb_number`, `password`, `role`, `created_at`, `reset_token`, `profile_picture`) VALUES
(3, 'ADMIN_NEW', '$2b$10$x0c0qGvm./6rJ4d4wY0fiunI7zgztEvutPN6TGEWJ.dNOGqhJc8ka', 'admin', '2025-02-16 01:57:41', NULL, NULL),
(17, 'pot123', '$2b$10$6yvuHkeX5UvTfrEPAxYnTO7lQ8P5wyvWFmZKLiSxuVnknF0JwrOhm', 'member', '2025-02-17 23:58:00', NULL, NULL),
(21, 'Lai123', '$2b$10$Wcig0cBjf0yKi.7kK5mLo.FPGcPm9MuKQ4FrMo/3WfpYXUBV2tTai', 'member', '2025-02-18 00:44:00', '5xcrtl02yjf', NULL),
(25, 'Eman123', '$2b$10$BCjW1S9ybQXp09CHPO2KOetbCvdWUZd4dQHa.PGSbohD4FQhaO8xK', 'member', '2025-02-19 11:24:19', NULL, NULL),
(42, 'John123', '$2b$10$zy9S4dGf7.SOuzIE358Jd.p35u8hAvlYaqig1ZxW3I8PgL4eitbpK', 'member', '2025-02-22 02:51:26', NULL, NULL),
(45, 'Kai123', '$2b$10$4rDekbKrByqx5Jb8Unz87eRE2fh3VaAjQuElNnTa1ejTkv42WRxpy', 'member', '2025-02-23 05:13:09', NULL, NULL),
(50, 'Jen123', '$2b$10$1GNUQ.peJPACeqAinDTd/.cr5e6o/cjZSRKoA.IPkbojlRJiHkzi.', 'member', '2025-03-01 15:50:47', 'k6t9pf6mqgr', NULL),
(58, 'Pau123', '$2b$10$c4/CDUxJA5roBEwHac8uy.WjBLWY.Y.vJVrrROOy7Gz5164TvUbmG', 'member', '2025-03-04 12:38:26', NULL, NULL),
(62, 'Myrna123', '$2b$10$Kv0dy8NyioUSrkrjAjqt4efpxTzwNampK43GQFcU6SFcQ3feuk8sK', 'member', '2025-03-12 12:48:17', NULL, NULL),
(64, 'Bhie123', '$2b$10$G360WyGbf.6WkoZr/zMocOL4TtXRy3/ZKr8JzjsZmY7oTS8TfMJli', 'member', '2025-03-16 15:44:12', NULL, NULL),
(78, 'papa123', '$2b$10$fuGJ0xsu4SrIGF/zDlPT3ev4I5CypDpsa/8bX1xzzOSbJpA90nI/u', 'member', '2025-07-01 03:56:32', NULL, NULL),
(79, 'A123', '$2b$10$/k9.htbgp2cUPR5EuQsqOOvIf9zTese9MsHQvscXvbRPqZ2pnrhP.', 'member', '2025-07-01 06:46:13', NULL, NULL),
(80, 'BL123', '$2b$10$321S9VWSYs9H5sryRwK76eGXfFHmBEcJWDSvgHqziU1V6WQqW37Iu', 'member', '2025-07-01 06:47:47', NULL, NULL),
(81, 'BK123', '$2b$10$u1M8EbQRSxtTxjfQiw6WCuGA7N.skrcpcsD9zQWONnyW9X/.Xx/mC', 'member', '2025-07-01 06:48:48', NULL, NULL),
(82, 'BM123', '$2b$10$kA1sF8d8G0A2ouxoJxkwqOKREzeYl.aF/ewQncRJRxWKGuuIinYYq', 'member', '2025-07-01 06:51:12', NULL, NULL),
(84, 'BM1234', '$2b$10$9gl0OD2pnm25v.wCd8czdu5GB8Vt9ybrmmhpPy6UQmEWpHH16yx9K', 'member', '2025-07-01 13:40:58', NULL, NULL),
(86, 'BM12346', '$2b$10$8XgCeWeQmjNPoogb1Q1s9uw8PgPocY2ZRLITaAiUZZQo.Vo8dzpQ6', 'member', '2025-07-01 14:05:36', NULL, NULL),
(88, 'BM12345', '$2b$10$X1qTyFbErCqufLdgeFwaiOqn4r/dpV.Ngm.apSJG1ZvhvikKcMOnm', 'member', '2025-07-01 14:50:35', NULL, NULL),
(89, 'baba123', '$2b$10$y3WJe6208t7N1Mq0VcGl9Occ5wM8e0LMNaakAxfimzUcKAf8HkyxW', 'clerk', '2025-07-22 02:12:31', NULL, NULL),
(90, 'bebe123', '$2b$10$MdT8Ue6zMvf40POVz5iKkeYIiGsnFjPl7b80DLmYzxbBj4PFs1IZS', 'cashier', '2025-07-24 02:19:26', NULL, NULL),
(95, 'sese123', '$2b$10$JDVPpUvOpmeVbafM7wK9Yet70HnjVM/VrZDZ6Lx4DHay8sCLEi7Xu', 'member', '2025-08-05 14:59:48', NULL, NULL),
(96, 'nene123', '$2b$10$gg4BJG8OoMNeqxpkGGgLHOqc90TclhiASIm0qW96LLNeLaQPGYqL6', 'member', '2025-08-16 15:54:32', NULL, NULL),
(127, 'Kim123', '$2b$10$hHN9TC4qqjiLldJ5vVri4OVcHlxmYd5p5m7Fo4a0.Q3tg5CYl8O0a', 'member', '2025-09-20 14:06:22', NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `loan_payments`
--
ALTER TABLE `loan_payments`
  ADD PRIMARY KEY (`payment_id`),
  ADD KEY `cb_number` (`cb_number`),
  ADD KEY `loan_id` (`loan_id`),
  ADD KEY `reference_number` (`reference_number`);

--
-- Indexes for table `members`
--
ALTER TABLE `members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cb_number` (`cb_number`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `member_savings`
--
ALTER TABLE `member_savings`
  ADD PRIMARY KEY (`savings_id`),
  ADD KEY `cb_number` (`cb_number`);

--
-- Indexes for table `payment_rejections`
--
ALTER TABLE `payment_rejections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payment_id` (`payment_id`);

--
-- Indexes for table `regular_agricultural_loans`
--
ALTER TABLE `regular_agricultural_loans`
  ADD UNIQUE KEY `application_no` (`application_no`),
  ADD KEY `application_no_2` (`application_no`),
  ADD KEY `cb_number` (`cb_number`),
  ADD KEY `application_status` (`application_status`);

--
-- Indexes for table `regular_agricultural_transaction`
--
ALTER TABLE `regular_agricultural_transaction`
  ADD PRIMARY KEY (`transaction_id`),
  ADD KEY `cb_number` (`cb_number`);

--
-- Indexes for table `salary_bonuses_loans`
--
ALTER TABLE `salary_bonuses_loans`
  ADD PRIMARY KEY (`application_no`),
  ADD KEY `cb_number` (`cb_number`);

--
-- Indexes for table `salary_loan_transactions`
--
ALTER TABLE `salary_loan_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cb_number` (`cb_number`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`cb_number`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `loan_payments`
--
ALTER TABLE `loan_payments`
  MODIFY `payment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- AUTO_INCREMENT for table `members`
--
ALTER TABLE `members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `member_savings`
--
ALTER TABLE `member_savings`
  MODIFY `savings_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment_rejections`
--
ALTER TABLE `payment_rejections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `regular_agricultural_transaction`
--
ALTER TABLE `regular_agricultural_transaction`
  MODIFY `transaction_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `salary_loan_transactions`
--
ALTER TABLE `salary_loan_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=128;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `members`
--
ALTER TABLE `members`
  ADD CONSTRAINT `members_ibfk_1` FOREIGN KEY (`cb_number`) REFERENCES `users` (`cb_number`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `member_savings`
--
ALTER TABLE `member_savings`
  ADD CONSTRAINT `member_savings_ibfk_1` FOREIGN KEY (`cb_number`) REFERENCES `members` (`cb_number`);

--
-- Constraints for table `payment_rejections`
--
ALTER TABLE `payment_rejections`
  ADD CONSTRAINT `payment_rejections_ibfk_1` FOREIGN KEY (`payment_id`) REFERENCES `loan_payments` (`payment_id`);

--
-- Constraints for table `regular_agricultural_loans`
--
ALTER TABLE `regular_agricultural_loans`
  ADD CONSTRAINT `regular_agricultural_loans_ibfk_1` FOREIGN KEY (`cb_number`) REFERENCES `members` (`cb_number`);

--
-- Constraints for table `regular_agricultural_transaction`
--
ALTER TABLE `regular_agricultural_transaction`
  ADD CONSTRAINT `regular_agricultural_transaction_ibfk_1` FOREIGN KEY (`cb_number`) REFERENCES `members` (`cb_number`);

--
-- Constraints for table `salary_bonuses_loans`
--
ALTER TABLE `salary_bonuses_loans`
  ADD CONSTRAINT `salary_bonuses_loans_ibfk_1` FOREIGN KEY (`cb_number`) REFERENCES `members` (`cb_number`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `salary_loan_transactions`
--
ALTER TABLE `salary_loan_transactions`
  ADD CONSTRAINT `salary_loan_transactions_ibfk_1` FOREIGN KEY (`cb_number`) REFERENCES `members` (`cb_number`),
  ADD CONSTRAINT `salary_loan_transactions_ibfk_2` FOREIGN KEY (`cb_number`) REFERENCES `salary_bonuses_loans` (`cb_number`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
