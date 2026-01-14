const {prisma} = require("../../config/db")

function normalizeName(name) {
  return name.toLowerCase().replace(/\s+/g, " ").trim();
}

function normalizePhone(phone) {
  return phone ? phone.replace(/\D/g, "") : null;
}

async function findFaculty({ name, phone }) {
  if (phone) {
    const byPhone = await prisma.user.findFirst({
      where: {
        phoneNumber: normalizePhone(phone),
        role: "FACULTY",
      },
    });
    if (byPhone) return byPhone;
  }

  if (name) {
    const byName = await prisma.user.findFirst({
      where: {
        role: "FACULTY",
        name: {
          equals: normalizeName(name),
          mode: "insensitive",
        },
      },
    });
    if (byName) return byName;
  }

  return null;
}


module.exports = {
    findFaculty
}
