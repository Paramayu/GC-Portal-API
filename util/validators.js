// util/validators.js

function isValidBnksEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@bnks\.edu\.np$/;
  return emailRegex.test(email);
}
function isValidNumber(time) {
  return typeof time == "number";
}
function isValidPassword(password) {
  return password.length >= 8 && password.length <= 20;
}

function isValidRollNumber(rollno) {
  const rollregex = /^[1-9][0-9]{3}[ef]$/;
  return rollregex.test(rollno);
}

function isValidGrade(grade) {
  return !isNaN(grade) && grade >= 11 && grade <= 14;
}

function isValidHouse(house) {
  return ["RH", "CH", "GH", "BH"].includes(house);
}

// Dynamic validation handler
function validateFields(fields) {
  const errors = [];

  if ("email" in fields && !isValidBnksEmail(fields.email)) {
    errors.push("Invalid email. Must be a valid bnks.edu.np email.");
  }
  if ("hourspentperweek" in fields && !isValidNumber(fields.hourspentperweek)) {
    errors.push(
      "Invalid hourspentperweek format. Hours spent per week must be a number."
    );
  }
  if (
    ("time" in fields && !isValidNumber(fields.time)) ||
    ("dateEnded" in fields && !isValidNumber(fields.dateEnded)) ||
    ("dateStarted" in fields && !isValidNumber(fields.dateStarted)) ||
    ("dateOfApplication" in fields &&
      !isValidNumber(fields.dateOfApplication)) ||
    ("dateAwarded" in fields && !isValidNumber(fields.dateAwarded)) ||
    ("attendingYear" in fields && !isValidNumber(fields.attendingYear))
  ) {
    errors.push(
      "Invalid time format. Must be a number representing time by the amount of milliseconds past the unix epoch."
    );
  }

  if ("password" in fields && !isValidPassword(fields.password)) {
    errors.push(
      "Invalid password. Must be at least 8 characters long and at most 20."
    );
  }

  if ("rollno" in fields && !isValidRollNumber(fields.rollno)) {
    errors.push(
      "Invalid roll number. Must be valid roll no with the generation letter at end."
    );
  }

  if (
    ("grade" in fields && !isValidGrade(fields.grade)) ||
    ("gradeWhenAwarded" in fields && !isValidGrade(fields.gradeWhenAwarded))
  ) {
    errors.push("Invalid grade. Must be between 11 and 14.");
  }
  if ("house" in fields && !isValidHouse(fields.house)) {
    errors.push("Invalid house. Must be a SSL house.");
  }
  return errors;
}

module.exports = {
  isValidBnksEmail,
  isValidPassword,
  isValidRollNumber,
  isValidGrade,
  isValidHouse,
  validateFields,
};
