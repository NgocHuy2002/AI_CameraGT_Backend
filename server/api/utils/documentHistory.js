import mongoose, { Schema } from 'mongoose';

const getDocumentHistoryObject = (originModel) => {
  let DocumentSchema = originModel.schema;
  let HistorySchema = new Schema({
    data: { type: DocumentSchema },
    document_id: { type: Schema.Types.ObjectId },
    action: String,
    created_by: { type: Schema.Types.ObjectId, ref: 'User' },
  }, {
    timestamps: {
      createdAt: 'created_at',
    },
    collation: { locale: 'vi' },
    versionKey: false,
  });
  let model;
  try {
    model = mongoose.model(originModel.collection.collectionName + '_history', HistorySchema);
  } catch (e) {
    model = mongoose.model(originModel.collection.collectionName + '_history');
  }
  return model;
};

const saveHistory = (document, model, action, userId) => {
  let DocumentHistory = getDocumentHistoryObject(model);
  let documentHistory;
  let isArray = (data) => {
    return (Object.prototype.toString.call(data) === '[object Array]');
  };
  if (isArray(document)) {
    let documents = [];
    document.forEach(doc => {
      documentHistory = new DocumentHistory();
      documentHistory.data = doc;
      documentHistory.document_id = doc._id;
      documentHistory.action = action;
      documentHistory.created_by = userId;
      documents.push(documentHistory);
    });
    DocumentHistory.create(documents).then().catch(err => console.log(err));
  } else {
    documentHistory = new DocumentHistory();
    documentHistory.data = document;
    documentHistory.document_id = document._id;
    documentHistory.action = action;
    documentHistory.save({ validateBeforeSave: false }).catch(err => console.log(err));
    documentHistory.created_by = userId;
  }
};

const getHistory = (model, documentId) => {
  let DocumentHistory = getDocumentHistoryObject(model);
  return DocumentHistory.find({ document_id: documentId });
};

export { saveHistory, getDocumentHistoryObject, getHistory };
