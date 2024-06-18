"use strict";

/**
 * student controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::student.student", ({ strapi }) => ({
  async create(ctx) {
    let { body } = ctx.request;

    if (typeof body !== "object" || body === null) {
      return ctx.badRequest("Request body must be an object");
    }

    const user = ctx.state.user;

    if (!user) {
      return ctx.badRequest("Invalid token");
    }

    const existingStudent = await strapi
      .query("api::student.student")
      .findOne({ where: { user: user.id } });

    if (existingStudent) {
      return ctx.badRequest("User already has an associated student");
    }

    const student = await strapi.service("api::student.student").create({
      data: {
        ...body,
        user: user.id,
      },
    });

    // update user role
    await strapi.entityService.update(
      "plugin::users-permissions.user",
      user.id,
      {
        data: {
          role: 3,
        },
      }
    );

    return student;
  },
}));
