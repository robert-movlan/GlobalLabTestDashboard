-- ============================
-- 🌐 Azure SQL Table Creation
-- ============================

-- Drop if exists (safe re-run)
IF OBJECT_ID('dbo.Employees', 'U') IS NOT NULL DROP TABLE dbo.Employees;
IF OBJECT_ID('dbo.Transactions', 'U') IS NOT NULL DROP TABLE dbo.Transactions;

-- ========== Employees ==========
CREATE TABLE dbo.Employees (
    EmployeeID INT PRIMARY KEY IDENTITY(1,1),
    FullName NVARCHAR(100) NOT NULL,
    Department NVARCHAR(50),
    Role NVARCHAR(50),
    HireDate DATE,
    MonthlySalary FLOAT
);

-- ========== Transactions ==========
CREATE TABLE dbo.Transactions (
    TransactionID INT PRIMARY KEY IDENTITY(1,1),
    EmployeeID INT FOREIGN KEY REFERENCES dbo.Employees(EmployeeID),
    TransactionDate DATE,
    Amount FLOAT,
    TransactionType NVARCHAR(50)
);
