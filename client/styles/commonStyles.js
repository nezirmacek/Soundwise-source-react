import Colors from './colors';

const commonStyles = {
  titleText: {
    fontSize: 16,
    fontWeight: 600,
  },
  inputTitleWrapper: {
    width: '100%',
    marginTop: 10,
    marginBottom: 20,
  },
  inputTitle: {
    height: 40,
    backgroundColor: Colors.mainWhite,
    width: '100%',
    fontSize: 18,
    borderRadius: 4,
    marginBottom: 0,
  },
  inputFileHidden: {
    position: 'absolute',
    display: 'block',
    overflow: 'hidden',
    width: 0,
    height: 0,
    border: 0,
    padding: 0,
  },
  inputFileVisible: {
    backgroundColor: 'transparent',
    width: 'calc(100% - 70px)',
    height: 40,
    float: 'left',
  },
  hostImage: {
    width: 100,
    height: 100,
    borderRadius: '50%',
    backgroundColor: Colors.mainWhite,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.lightGrey,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
    backgroundSize: 'cover',
  },
  tableWrapper: {
    marginTop: 25,
    backgroundColor: Colors.mainWhite,
    padding: 25,
    overflow: 'auto',
    maxHeight: 650,
  },
  cancelImg: {
    color: Colors.link,
    marginLeft: 20,
    fontSize: 16,
    cursor: 'pointer',
  },
  loaderWrapper: {
    height: 133,
    paddingTop: 20,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 20,
  },
  image: {
    width: 133,
    height: 133,
    backgroundColor: Colors.mainWhite,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.lightGrey,
  },
  dropdownTitle: {
    borderWidth: 2,
    borderRadius: 5,
    borderColor: 'black',
    backgroundColor: 'white',
    padding: 10,
    borderColor: 'black',
    fontSize: '16px',
  },
  categoryButton: {
    width: 370,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    backgroundColor: 'white',
    padding: 10,
  },
};

export default commonStyles;
