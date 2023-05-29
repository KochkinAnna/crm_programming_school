-- CreateTable
CREATE TABLE `orders` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `surname` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `age` INTEGER NULL,
    `course` VARCHAR(191) NULL,
    `course_format` VARCHAR(191) NULL,
    `course_type` VARCHAR(191) NULL,
    `sum` INTEGER NULL,
    `alreadyPaid` INTEGER NULL,
    `created_at` DATETIME(3) NULL,
    `utm` VARCHAR(191) NULL,
    `msg` VARCHAR(191) NULL,
    `status` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
