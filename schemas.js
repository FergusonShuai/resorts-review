const BaseJoi = require("joi");
const sanitizeHtml = require("sanitize-html");

const extension = (joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    "string.escapeHTML": "{{#label}} must not include HTML!",
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
        if (clean !== value)
          return helpers.error("string.escapeHTML", { value });
        return clean;
      },
    },
  },
});

const Joi = BaseJoi.extend(extension);

module.exports.resortJoiSchema = Joi.object({
  resort: Joi.object({
    title: Joi.string().required().escapeHTML(),
    peakElevation: Joi.number().required().min(0),
    baseElevation: Joi.number().required().min(0),
    verticalDrop: Joi.number().required().min(0),
    skiableAcreage: Joi.number().required().min(0),
    totalTrails: Joi.number().required().min(0),
    totalLifts: Joi.number().required().min(0),
    avgAnnualSnowFall: Joi.number().required().min(0),
    location: Joi.string().required().escapeHTML(),
  }).required(),
  deleteImages: Joi.array(),
});

module.exports.reviewJoiSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    body: Joi.string().required().escapeHTML(),
  }).required(),
});
