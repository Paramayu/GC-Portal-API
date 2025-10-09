// models/plugins/softDelete.js

function softDeletePlugin(schema, options) {
  // Add the soft-delete fields to the schema
  schema.add({
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  });

  // Automatically exclude soft-deleted documents from "find" queries
  schema.pre(/^find/, function (next) {
    // If you pass { withDeleted: true } in the query options, it will skip this filter
    if (!this.getOptions().withDeleted) {
      this.where({ isDeleted: false });
    }
    next();
  });

  // Add a method to soft delete
  schema.methods.softDelete = async function () {
    this.isDeleted = true;
    this.deletedAt = new Date();
    await this.save();
  };

  // Add a method to restore
  schema.methods.restore = async function () {
    this.isDeleted = false;
    this.deletedAt = null;
    await this.save();
  };

  // Optional: Add a static helper to soft-delete multiple docs
  schema.statics.softDeleteMany = function (filter = {}) {
    return this.updateMany(filter, {
      $set: { isDeleted: true, deletedAt: new Date() },
    });
  };

  // Optional: Add a static helper to restore multiple docs
  schema.statics.restoreMany = function (filter = {}) {
    return this.updateMany(filter, {
      $set: { isDeleted: false, deletedAt: null },
    });
  };
}

module.exports = softDeletePlugin;
