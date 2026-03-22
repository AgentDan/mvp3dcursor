const Model3D = require('./model');

async function listModels({ ownerUserId } = {}) {
  const filter = ownerUserId ? { ownerUserId } : {};
  const docs = await Model3D.find(filter).sort({ createdAt: -1 }).lean();
  const models = (docs || []).map((doc) => ({
    id: doc._id?.toString(),
    s3Key: doc.s3Key,
    ownerUserId: doc.ownerUserId ? doc.ownerUserId.toString() : null,
    ownerNickname: doc.ownerNickname || null,
    title: doc.title || null,
    createdAt: doc.createdAt || null,
  }));
  return { models };
}

async function createModel({ s3Key, ownerUserId, ownerNickname, title }) {
  if (!s3Key || !ownerUserId) return null;
  const doc = await Model3D.findOneAndUpdate(
    { s3Key },
    {
      s3Key,
      ownerUserId,
      ownerNickname: ownerNickname || undefined,
      ...(title ? { title } : {}),
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );
  return doc;
}

module.exports = {
  listModels,
  createModel,
};
