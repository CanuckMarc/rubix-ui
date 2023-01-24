import { Button } from "antd";
import { PlusOutlined } from '@ant-design/icons';

export const TabContent = (props: any) => {
    const { createCat, type, form, handleOnClick, handleCancel, handleCreate, exisitingElements, buttonName } = props;
    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '2vh'}}>
            <Button type="primary" icon={<PlusOutlined />} size={'middle'} disabled={(createCat == type)} onClick={handleOnClick} style={{width: '8vw'}}>{buttonName}</Button>
                {(createCat == type) && (
                    <>
                        {form}
                        <div style={{display: 'flex', flexDirection: 'row', gap: '1vw'}}>
                            <Button type="primary" danger={true} size={'middle'} onClick={handleCancel}>Cancel</Button>
                            <Button type="primary" size={'middle'} onClick={handleCreate}>Ok</Button>
                        </div>
                    </>
                )}
            <hr className="solid"/>
            {exisitingElements}
        </div>
    );
}

export default TabContent;