"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async users(ctx) {
    const { supplier_setting_id } = ctx.params;

    if (supplier_setting_id === undefined)
      return ctx.badRequest("supplier_setting_id is requred");

    if (
      !ctx.state.user ||
      ctx.state.user.supplier_setting !== Number(supplier_setting_id)
    ) {
      return ctx.forbidden("user is not include supplier_setting_id");
    }

    const userList = await strapi.query("dropshipper-settings").find({
      supplier_settings_contains: supplier_setting_id,
    });

    return userList;
  },

  async removeUser(ctx) {
    if (!ctx.state.user || ctx.state.user.supplier_setting === undefined) {
      return ctx.badRequest("user is not supplier");
    }

    const { dropshipper_setting_id } = ctx.params;

    if (dropshipper_setting_id === undefined) {
      return ctx.badRequest("supplier_setting_id is requred");
    }

    const { supplier_setting } = ctx.state.user;

    const supplier = await strapi
      .query("supplier-settings")
      .findOne({ id: supplier_setting });

    if (!supplier) {
      return ctx.badRequest("supplier does not exist");
    }

    const dropshipper_setting_id_number = Number(dropshipper_setting_id);

    const filtered_array = supplier.dropshipper_settings.filter(
      (ds) => ds.id !== dropshipper_setting_id_number
    );

    await strapi.query("supplier-settings").update(
      { id: supplier_setting },
      {
        dropshipper_settings: filtered_array.map((ds) => ds.id),
      }
    );

    return true;
  },

  async orders(ctx) {
    if (!ctx.state.user || ctx.state.user.supplier_setting === undefined) {
      return ctx.badRequest("user is not supplier");
    }

    const orderList = await strapi
      .query("order")
      .find({ supplier_setting: ctx.state.user.supplier_setting }, [
        "product_orders.product",
      ]);

    return orderList;
  },

  async changeStatus(ctx) {
    if (!ctx.state.user || ctx.state.user.supplier_setting === undefined) {
      return ctx.badRequest("user is not supplier");
    }
    const { order_id } = ctx.params;

    if (order_id === undefined) {
      return ctx.badRequest("order_id is requred");
    }

    const { status } = ctx.query;

    if (status === undefined) {
      return ctx.badRequest("status is requred");
    }

    console.log(order_id, status);

    return await strapi
      .query("order")
      .update(
        { id: order_id, supplier_setting: ctx.state.user.supplier_setting },
        { status: status }
      );
  },
};
